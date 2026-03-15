'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function PlayerLobby() {
  const { pin } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  const supabase = createClient();

  useEffect(() => {
    let activeChannel: RealtimeChannel;

    const setupLobby = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth');

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
        
      if (profile) setUsername(profile.username);

      // Listen for game:start broadcast
      activeChannel = supabase.channel(`room:${pin}`);
      
      activeChannel.on(
        'broadcast',
        { event: 'game:start' },
        () => {
          // Host started game, redirect player to game view
          router.push(`/play/game/${pin}`);
        }
      );

      activeChannel.subscribe();
      setLoading(false);
    };

    setupLobby();

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [pin, router, supabase]);

  if (loading) {
    return <Loader2 className="w-12 h-12 text-white animate-spin" />;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden max-w-sm w-full">
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-yellow-400/20 animate-pulse pointer-events-none" />
        
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">¡Estás dentro!</h2>
        <p className="text-purple-200 text-lg mb-8 relative z-10">
          Hola, <span className="font-bold text-yellow-400">{username}</span>
        </p>
        
        <div className="relative z-10 bg-black/20 p-6 rounded-2xl border border-white/10">
          <p className="text-white text-xl animate-bounce">
            ¿Ves tu nombre en la pantalla?
          </p>
          <p className="text-purple-300 mt-4 text-sm">
            Esperando a que el profesor inicie la partida...
          </p>
        </div>
      </div>
    </div>
  );
}
