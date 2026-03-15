import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Brain, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'alumno') {
    redirect('/host');
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-indigo-900 to-blue-900 opacity-50 z-0" />
      
      {/* Minimal Header for Player */}
      <header className="relative z-10 w-full p-4 flex justify-between items-center">
        <Link href="/play" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border border-white/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <span>{profile?.avatar}</span>
            <span className="text-sm font-bold text-white max-w-[100px] truncate">{profile?.username}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-white/50 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
