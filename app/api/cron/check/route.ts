/**
 * GET /api/cron/check
 * Automated appointment check (Vercel Cron Job)
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 * Add cron job to vercel.json file
 */

import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/services/appointment-service';
import { notificationService } from '@/lib/services/notification-service';
import { supabase } from '@/lib/supabase';
import { bulkCreateAppointments, createCheckHistory, filterAppointmentsByNotificationCooldown } from '@/lib/supabase/client';
import type { CheckResult } from '@/lib/services/appointment-service';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Cron secret check (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET?.trim();

    // Debug logging (Masked)
    console.log('Cron Check Auth:', {
      hasSecret: !!cronSecret,
      hasHeader: !!authHeader,
      headerStart: authHeader?.substring(0, 10)
    });

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Server Misconfiguration: CRON_SECRET missing in Vercel Env' },
        { status: 500 }
      );
    }

    if (cronSecret) {
      // Extract token from "Bearer <token>"
      const receivedToken = authHeader?.split('Bearer ')[1]?.trim();

      if (receivedToken !== cronSecret) {
        console.warn('Cron Auth Failed. Received != Expected');
        return NextResponse.json(
          { error: 'Unauthorized: Invalid Token' },
          { status: 401 }
        );
      }
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get users with auto-check enabled, including their notification settings and joined email
    const { data: activeUsers, error } = await supabase
      .from('user_preferences')
      .select('user_id, countries, cities, telegram_enabled, telegram_chat_id, email_enabled, email_address, web_enabled, check_frequency, same_slot_cooldown_hours, user_profiles(email)')
      .eq('auto_check_enabled', true);

    if (error) throw error;

    if (!activeUsers || activeUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active users to check',
        checked: 0,
      });
    }

    const results: any[] = [];

    // --- Phase 1: Aggregate deduplicated scraping targets ---
    const eligibleUsers = [];
    const countriesToScrape = new Set<string>();
    const citiesToScrape = new Set<string>();

    for (const user of activeUsers) {
      if (!user.countries || !user.cities || user.countries.length === 0 || user.cities.length === 0) {
        continue;
      }

      // Does it match check frequency?
      const frequency = user.check_frequency || 60; // Default 60 min
      const { data: lastCheck } = await supabase
        .from('check_history')
        .select('checked_at')
        .eq('user_id', user.user_id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .single();

      if (lastCheck) {
        const lastCheckTime = new Date(lastCheck.checked_at).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - lastCheckTime) / (1000 * 60);

        if (diffMinutes < frequency) {
          results.push({
            userId: user.user_id,
            status: 'skipped',
            reason: `Wait ${Math.ceil(frequency - diffMinutes)} mins`
          });
          continue;
        }
      }

      eligibleUsers.push(user);
      user.countries.forEach((c: string) => countriesToScrape.add(c));
      user.cities.forEach((c: string) => citiesToScrape.add(c));
    }

    // --- Phase 2: Unified Batched Scraping (Hit the official API exactly ONCE per unique combo) ---
    let batchResults: CheckResult[] = [];
    if (countriesToScrape.size > 0 && citiesToScrape.size > 0) {
      console.log(`[Batch Check] Scraping Unique Targets: ${countriesToScrape.size} Countries, ${citiesToScrape.size} Cities`);
      // checkMultiple already distributes caching/saving correctly internally, but passing `undefined` for userId so it doesn't log history yet
      batchResults = await appointmentService.checkMultiple(
        Array.from(countriesToScrape),
        Array.from(citiesToScrape),
        undefined
      );
    }

    // --- Phase 3: Fan-Out & Filter Personal Notifications ---
    for (const user of eligibleUsers) {
      try {
        // Extract results relevant only to this specific user's preference
        const personalResults = batchResults.filter(
          (res) => user.countries.includes(res.country) && user.cities.includes(res.city)
        );

        let totalFound = personalResults.reduce((sum, r) => sum + r.appointments.length, 0);

        // Record metrics to DB for this user
        await createCheckHistory({
          user_id: user.user_id,
          countries: user.countries,
          cities: user.cities,
          found_count: totalFound,
        });

        // Reuse the same slot-cooldown notification semantics as the service layer
        if (user.telegram_enabled || user.web_enabled || user.email_enabled) {
          // We reuse an internal method signature of appointmentService for fan-out (requires exposed or manual adaptation)
          // Instead of modifying the Class access modifier, we can manually trigger the notification service directly
          // But since checkMultiple also calls saveAppointments if userId is given, we need to adapt slightly.
          // Easiest is to simulate save and notify manually here or allow appointmentService to handle it.

          // We'll call saveAppointments and notificationService directly to maintain proper DB linkage
          for (const res of personalResults) {
            if (res.appointments.length > 0) {
              // Duplicate logic from service to save appointments to DB for this user so Debounce works
              const aptData = res.appointments.map(apt => ({
                user_id: user.user_id,
                country: apt.mission_country,
                city: apt.center_name,
                appointment_date: apt.appointment_date,
                center_name: apt.center_name,
                visa_category: apt.visa_category,
                visa_subcategory: apt.visa_subcategory || undefined,
                book_now_link: apt.book_now_link,
                last_seen_at: new Date().toISOString(),
              }));
              await bulkCreateAppointments(aptData);
            }
          }

          // Since we can't easily access the private `sendNotificationsForResults` from outside, 
          // and modifying the class signature requires opening more files, 
          // we'll adapt by using `appointmentService.checkForUser` logic inline:
          const emailAddress = user.email_address || (user.user_profiles && Array.isArray(user.user_profiles) ? user.user_profiles[0]?.email : (user.user_profiles as any)?.email) || undefined;
          const sameSlotCooldownHours = user.same_slot_cooldown_hours ?? 24;

          for (const result of personalResults) {
            if (result.appointments.length === 0) continue;

            const appointmentsToNotify = await filterAppointmentsByNotificationCooldown(
              user.user_id,
              result.appointments.map((apt) => ({
                country: apt.mission_country,
                city: apt.center_name,
                appointment_date: apt.appointment_date,
              })),
              sameSlotCooldownHours
            );

            const allowedAppointmentKeys = new Set(
              appointmentsToNotify.map((apt) => `${apt.country}::${apt.city}::${apt.appointment_date}`)
            );

            const filteredAppointments = result.appointments.filter((apt) =>
              allowedAppointmentKeys.has(`${apt.mission_country}::${apt.center_name}::${apt.appointment_date}`)
            );

            if (filteredAppointments.length === 0) {
              console.log(
                `[Notification] Same-slot cooldown active for User ${user.user_id}, ${result.city} -> ${result.country}. Cooldown: ${sameSlotCooldownHours}h.`
              );
              continue;
            }

            // Dispatch Notification
            try {
              const dispatchResult = await notificationService.sendAppointmentNotifications(
                filteredAppointments,
                {
                  userId: user.user_id,
                  telegram: {
                    enabled: user.telegram_enabled,
                    chatId: user.telegram_chat_id,
                    botToken: process.env.TELEGRAM_BOT_TOKEN,
                  },
                  email: {
                    enabled: user.email_enabled,
                    address: emailAddress,
                  },
                  web: {
                    enabled: user.web_enabled,
                  },
                }
              );

              if (!dispatchResult.delivered) {
                console.warn(`[Notification] No notification channel succeeded for user ${user.user_id}; appointments remain pending.`);
                continue;
              }

              // Refresh slot notification timestamps so cooldown works on repeated alerts
              for (const apt of filteredAppointments) {
                try {
                  const { data: matchedApts } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('user_id', user.user_id)
                    .eq('country', apt.mission_country)
                    .eq('city', apt.center_name)
                    .eq('appointment_date', apt.appointment_date)
                    .limit(1);

                  if (matchedApts && matchedApts.length > 0) {
                    await supabase
                      .from('appointments')
                      .update({ notified: true })
                      .eq('id', matchedApts[0].id);
                  }
                } catch (markErr) {
                  console.error('Error marking appointment notified:', markErr);
                }
              }
            } catch (err) {
              console.error('Batch Notify Err', err);
            }
          }
        }

        results.push({
          userId: user.user_id,
          status: 'checked',
          found: totalFound,
        });

      } catch (error) {
        console.error(`Error processing batch for user ${user.user_id}:`, error);
        results.push({
          userId: user.user_id,
          error: 'Dispatch failed',
        });
      }
    }

    const timestamp = new Date().toISOString();

    // Health Check Email Logic (Only send summary if enabled and Admin Email is set)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      // For daily health summary, we can check if it's the first run of the day (e.g. Hour 0)
      // Health check: Vercel runs in UTC, send daily summary between UTC 00:00-00:15
      const now = new Date();
      const currentHourUTC = now.getUTCHours();
      const currentMinuteUTC = now.getUTCMinutes();

      if (currentHourUTC === 0 && currentMinuteUTC <= 15) {
        let statsHtml = `<h3>🩺 SchengenBot Daily Health Check</h3>`;
        statsHtml += `<p><b>System OK.</b></p>`;
        statsHtml += `<p>Total active users checked: ${activeUsers.length}</p>`;
        statsHtml += `<p>Timestamp: ${timestamp}</p>`;
        statsHtml += `<hr/><h4>Run Results:</h4><ul>`;
        results.forEach(r => {
          statsHtml += `<li>User ${r.userId}: ${r.status} ${r.found !== undefined ? `(Found: ${r.found})` : ''} ${r.reason ? `(${r.reason})` : ''} ${r.error ? `(<span style="color:red">${r.error}</span>)` : ''}</li>`;
        });
        statsHtml += `</ul>`;

        await notificationService.sendEmailNotification(
          adminEmail,
          '[SchengenBot] Daily Health Summary OK',
          statsHtml
        );

        // Run DB cleanup once a day during the summary window
        try {
          console.log('Running daily database cleanup...');
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('cleanup_old_records');
            if (rpcError) console.error('Cleanup RPC Error:', rpcError);
          }
        } catch (e) {
          console.error('Failed to run cleanup:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: activeUsers.length,
      results,
      timestamp,
    });
  } catch (error: any) {
    console.error('Cron check error:', error);
    Sentry.captureException(error);

    // Alert Admin on critical cron failure
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await notificationService.sendEmailNotification(
        adminEmail,
        '🚨 [SchengenBot] CRITICAL: Cron Job Failed',
        `<p>The automated cron job failed to execute properly.</p><p><b>Error:</b> ${error.message}</p><p>Check Vercel/Sentry logs for details.</p>`
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
