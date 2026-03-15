import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Fetch grades aggregated. 
    // Usually done via SQL view/function, but for simplicity we aggregate here.
    const { data: answers, error } = await supabase
      .from('answers')
      .select(`
        is_correct,
        points_earned,
        profiles (
          id,
          username,
          email
        )
      `);

    if (error) throw error;

    const gradesMap = new Map();

    const typedAnswers = answers as unknown as Array<{
      is_correct: boolean;
      points_earned: number;
      profiles: { id: string; username: string; email: string; };
    }>;

    typedAnswers.forEach((ans) => {
      const studentId = ans.profiles.id;
      if (!gradesMap.has(studentId)) {
        gradesMap.set(studentId, {
          id: studentId,
          username: ans.profiles.username,
          email: ans.profiles.email,
          total_questions: 0,
          correct_answers: 0,
          total_points: 0
        });
      }
      
      const student = gradesMap.get(studentId);
      student.total_questions += 1;
      if (ans.is_correct) student.correct_answers += 1;
      student.total_points += ans.points_earned;
    });

    const grades = Array.from(gradesMap.values()).map(student => ({
      ...student,
      // Base /10 note assuming out of their total answers
      grade_10: student.total_questions > 0 
        ? ((student.correct_answers / student.total_questions) * 10).toFixed(2) 
        : "0.00"
    }));

    return NextResponse.json(grades);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
