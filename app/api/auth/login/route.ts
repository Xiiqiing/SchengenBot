import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/lib/user-id';
import {
  clearInviteVerificationCookie,
  createSessionToken,
  isInviteVerificationValid,
  setSessionCookie,
} from '@/lib/auth/session';

/**
 * POST /api/auth/login
 * Handle email-based login without password
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database configuration missing' },
                { status: 500 }
            );
        }

        if (!(await isInviteVerificationValid(request))) {
            return NextResponse.json(
                { error: 'Invitation verification required' },
                { status: 401 }
            );
        }
        // 1. Check if user exists with this email
        const { data: existingUser, error: fetchError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .eq('email', normalizedEmail)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching user:', fetchError);
            throw fetchError;
        }

        let userId = existingUser?.id;
        let isNewUser = false;

        // 2. If user doesn't exist, create a new one
        if (!existingUser) {
            const newUserId = generateUUID();
            const { data: newUser, error: createError } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        id: newUserId,
                        email: normalizedEmail,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (createError) {
                console.error('Error creating user:', createError);
                throw createError;
            }

            userId = newUser.id;
            isNewUser = true;
        }

        // 3. Return success with cookie
        const response = NextResponse.json({
            success: true,
            userId,
            isNewUser
        });

        const sessionToken = await createSessionToken(userId);
        setSessionCookie(response, sessionToken);
        clearInviteVerificationCookie(response);

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
