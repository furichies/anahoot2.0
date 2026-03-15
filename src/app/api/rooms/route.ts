import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Generate 4 digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Create room
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        id: pin,
        host_id: user.id,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) {
      console.error('Create room error:', error);
      
      // If PIN collision occurs, try again (simple handling)
      if (error.code === '23505') {
        const pin2 = Math.floor(1000 + Math.random() * 9000).toString();
        const { data: data2, error: error2 } = await supabase
          .from('rooms')
          .insert({ id: pin2, host_id: user.id, status: 'waiting' })
          .select().single();
          
        if (error2) throw error2;
        return NextResponse.json({ room_id: data2.id });
      }
      
      throw error;
    }

    return NextResponse.json({ room_id: data.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
