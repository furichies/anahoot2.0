import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Fetch grades aggregated by room and profile.
    const { data: answers, error } = await supabase
      .from('answers')
      .select(`
        room_id,
        is_correct,
        points_earned,
        profiles (
          id,
          username,
          email
        )
      `);

    if (error) throw error;

    // Grouping by student AND room to show historical records
    const grouping = new Map<string, {
      room_id: string;
      id: string;
      username: string;
      email: string;
      total_questions: number;
      correct_answers: number;
      total_points: number;
    }>();

    (answers as {room_id: string, is_correct: boolean, points_earned: number, profiles: {id: string, username: string, email: string} | {id: string, username: string, email: string}[]}[]).forEach((ans) => {
      // Supabase returns an object for one-to-many joined rows (like answers -> profile via player_id)
      const profile = Array.isArray(ans.profiles) ? ans.profiles[0] : ans.profiles;
      if (!profile) return;
      const key = `${ans.room_id}-${profile.id}`;
      if (!grouping.has(key)) {
        grouping.set(key, {
          room_id: ans.room_id,
          id: profile.id,
          username: profile.username,
          email: profile.email,
          total_questions: 0,
          correct_answers: 0,
          total_points: 0
        });
      }
      
      const entry = grouping.get(key)!;
      entry.total_questions += 1;
      if (ans.is_correct) entry.correct_answers += 1;
      entry.total_points += ans.points_earned;
    });

    const grades = Array.from(grouping.values()).map(entry => ({
      ...entry,
      grade_10: entry.total_questions > 0 
        ? ((entry.correct_answers / entry.total_questions) * 10).toFixed(2) 
        : "0.00"
    }));

    // Sort by room_id descending (newest first)
    grades.sort((a, b) => b.room_id.localeCompare(a.room_id));

    return NextResponse.json(grades);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
