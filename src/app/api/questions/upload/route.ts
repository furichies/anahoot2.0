import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'profesor') {
      return NextResponse.json({ error: 'Solo profesores pueden subir preguntas' }, { status: 403 });
    }

    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Formato inválido. Se esperaba un array de preguntas.' }, { status: 400 });
    }

    // First delete existing questions to replace them (as per V1.0 behavior)
    await supabase.from('questions').delete().neq('id', 0); // Delete all

    // Insert new questions
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();

    if (error) {
      console.error('Error inserting questions:', error);
      throw error;
    }

    return NextResponse.json({ success: true, count: data.length });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const msg = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
