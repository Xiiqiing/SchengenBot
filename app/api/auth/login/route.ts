import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/lib/user-id';

/**
 * POST /api/auth/login
 * Handle email-based login without password
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
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

        // 1. Check if user exists with this email
        const { data: existingUser, error: fetchError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .eq('email', email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching user:', fetchError);
            throw fetchError;
        }

        // 2. If user exists, return their ID
        if (existingUser) {
            return NextResponse.json({
                success: true,
                userId: existingUser.id,
                isNewUser: false
            });
        }

        // 3. If user doesn't exist, create a new one
        // Note: We need to generate a UUID here or let DB do it. 
        // Since we use random UUIDs elsewhere, we'll generate one here if needed, 
        // or let Supabase/Postgres generate it if the column is set to default gen_random_uuid()

        // Let's try inserting without ID first, assume DB handles it.
        // However, our profiles table might not have default gen_random_uuid().
        // Let's generate one to be safe and consistent with our client-side logic.
        const newUserId = generateUUID();

        const { data: newUser, error: createError } = await supabase
            .from('user_profiles')
            .insert([
                {
                    id: newUserId,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
            throw createError;
        }

        // Also Initialize empty preferences for new user?
        // We can do it lazily when they save settings, but creating empty record here is cleaner.
        // But currently preferences are created on save. Let's keep it lazy to avoid complexity.

        return NextResponse.json({
            success: true,
            userId: newUser.id,
            isNewUser: true
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
