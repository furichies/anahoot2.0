import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Para crear alumnos, necesitas configurar SUPABASE_SERVICE_ROLE_KEY en .env.local' },
        { status: 400 }
      );
    }

    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
        return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // 1. Create User in Auth using Admin function (doesn't log out current user)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can log in
      user_metadata: {
        username,
        role: 'alumno',
        avatar: '👤'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (authData.user) {
        // 2. Explicitly create profile
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
            id: authData.user.id,
            username,
            email,
            role: 'alumno',
            avatar: '👤'
        });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Delete auth user if profile creation failed to maintain consistency
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: 'Error al crear el perfil del alumno: ' + profileError.message }, { status: 500 });
        }
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: unknown) {
    console.error('Create user error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
