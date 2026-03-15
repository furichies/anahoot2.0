'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@/components/ui/button';
import { Play, Users, Loader2 } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function HostLobby() {
  const { pin } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { players, setPlayers, setRoom } = useGameStore();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let activeChannel: RealtimeChannel;

    const setupLobby = async () => {
      // 1. Verify room exists and belongs to host
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth');

      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', pin)
        .eq('host_id', user.id)
        .single();

      if (error || !room) {
        alert('Sala no encontrada o no tienes permisos');
        return router.push('/host');
      }

      setRoom(room.id, true);

      // 2. Load existing players
      const { data: playersData } = await supabase
        .from('room_players')
        .select(`
          player_id,
          profiles (
            id,
            username,
            avatar
          )
        `)
        .eq('room_id', pin);

      if (playersData) {
        setPlayers(playersData.map((p: { profiles: { id: string; username: string; avatar: string } }) => ({
          id: p.profiles.id,
          username: p.profiles.username,
          avatar: p.profiles.avatar,
          score: 0
        })));
      }

      setLoading(false);

      // 3. Setup Supabase Realtime for Presence and Inserts
      activeChannel = supabase.channel(`room:${pin}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Listen for new players joining via DB inserts
      activeChannel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_players', filter: `room_id=eq.${pin}` },
        async (payload) => {
          // Fetch the full profile of the new player
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.player_id)
            .single();

          if (newProfile) {
            useGameStore.getState().addPlayer({
              id: newProfile.id,
              username: newProfile.username,
              avatar: newProfile.avatar,
              score: 0
            });
          }
        }
      );

      activeChannel.subscribe();
      setChannel(activeChannel);
    };

    setupLobby();

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [pin, router, supabase, setRoom, setPlayers]);

  const handleStartGame = async () => {
    if (players.length === 0) {
       if (!confirm('No hay jugadores conectados. ¿Empezar de todas formas?')) return;
    }
    
    // Update DB
    await supabase
      .from('rooms')
      .update({ status: 'playing', current_question_index: 0 })
      .eq('id', pin);

    // Broadcast event
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'game:start',
        payload: {}
      });
    }

    router.push(`/host/game/${pin}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-purple-100 flex flex-col items-center flex-1">
        
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-purple-800 mb-2">PIN DE LA PARTIDA</h2>
          <div className="text-7xl md:text-[9rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-600 tracking-wider font-mono">
            {pin}
          </div>
          <p className="text-lg text-gray-500 mt-4">Esperando jugadores...</p>
        </div>

        <div className="w-full max-w-4xl bg-purple-50 rounded-2xl p-6 min-h-[300px] border border-purple-100 mb-12 relative flex flex-col">
          <div className="absolute top-4 right-6 flex items-center gap-2 text-purple-700 bg-white px-4 py-2 rounded-full shadow-sm font-bold">
            <Users className="w-5 h-5" />
            <span className="text-xl">{players.length}</span>
          </div>

          <h3 className="text-xl font-bold text-purple-900 mb-6">Jugadores Conectados</h3>

          {players.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <span className="animate-pulse">Esperando alumnos...</span>
            </div>
          ) : (
            <div className="flexflex-wrap gap-4 items-start justify-center overflow-y-auto">
              {players.map((player) => (
                <div key={player.id} className="animate-scale-in flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border border-purple-100 w-24">
                  <div className="text-4xl mb-2">{player.avatar}</div>
                  <div className="text-xs font-bold text-center text-purple-900 truncate w-full px-1">
                    {player.username}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={handleStartGame}
          size="lg"
          className="w-full max-w-md h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group"
        >
          INICIAR PARTIDA
          <Play className="ml-2 w-6 h-6 group-hover:scale-125 transition-transform" fill="currentColor" />
        </Button>

      </div>
    </div>
  );
}
