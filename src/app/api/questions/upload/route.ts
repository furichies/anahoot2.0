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

    const parsedQuestions = questions.map((q: {
      text: string;
      image?: string;
      options?: { A: string; B: string; C: string; D: string };
      option_a?: string;
      option_b?: string;
      option_c?: string;
      option_d?: string;
      correctAnswer?: string;
      correct_answer?: string;
      explanation?: string;
      category?: string;
    }) => ({
      text: q.text,
      image: q.image || null,
      option_a: q.options?.A || q.option_a,
      option_b: q.options?.B || q.option_b,
      option_c: q.options?.C || q.option_c,
      option_d: q.options?.D || q.option_d,
      correct_answer: q.correctAnswer || q.correct_answer,
      explanation: q.explanation || '',
      category: q.category || 'General'
    }));

    // Insert new questions
    const { data, error } = await supabase
      .from('questions')
      .insert(parsedQuestions)
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
