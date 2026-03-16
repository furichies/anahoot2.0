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

    // 1. Delete from auth.users (this also deletes from profiles if there is a trigger or if we do it manually)
    // Actually, in many Supabase setups, deleting from auth.users is the way to go.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      // If it fails, maybe it's because the user doesn't exist in Auth but exists in profiles
      // Let's try to delete from profiles anyway
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id);
        
      if (profileError) throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
