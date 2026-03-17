import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // We need the service role key to delete users from Auth
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Para eliminar alumnos, necesitas obtener tu "Service Role Key" (secret) de Supabase (Project Settings -> API) y añadirlo como SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // We need to clean up references first because the database constraints
    // (room_players, answers, etc.) might not have ON DELETE CASCADE set
    // pointing to auth.users or profiles.

    // 1. Delete user's answers
    const { error: answersError } = await supabaseAdmin
      .from('answers')
      .delete()
      .eq('player_id', id);
    if (answersError) console.error('Error deleting user answers:', answersError);

    // 2. Delete user's room participations
    const { error: roomPlayersError } = await supabaseAdmin
      .from('room_players')
      .delete()
      .eq('player_id', id);
    if (roomPlayersError) console.error('Error deleting user room participations:', roomPlayersError);

    // 3. Delete user's rooms (if they are a host)
    const { error: roomsError } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('host_id', id);
    if (roomsError) console.error('Error deleting user rooms:', roomsError);

    // 4. Delete profile explicitly (in case auth.users cascade is missing)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);
    if (profileError) console.error('Error deleting profile:', profileError);

    // 5. Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw authError; // or return error if we want it to fail explicitly
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
