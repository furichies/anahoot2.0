import { createClient } from '@/lib/supabase-server';
import HostDashboard from '@/components/host/HostDashboard';

export default async function HostPage() {
  const supabase = await createClient();
  
  // Fetch questions for the "Preguntas" tab
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  // Add more fetch logic here for grades and history later
  
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <HostDashboard initialQuestions={questions || []} />
    </div>
  );
}
