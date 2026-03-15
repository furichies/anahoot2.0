'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/stores/game-store';

export default function PlayerJoin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setRoom } = useGameStore();

  const supabase = createClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // 2. Check if room exists and is waiting
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', pin)
        .single();

      if (roomError || !room) {
        throw new Error('El PIN no existe o la sala ya cerró');
      }

      if (room.status !== 'waiting') {
        throw new Error('La partida ya ha comenzado');
      }

      // 3. Join room
      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: pin,
          player_id: user.id,
        })
        .select()
        .single();

      // If already joined (unique constraint), that's fine, proceed
      if (joinError && joinError.code !== '23505') {
        throw joinError;
      }

      setRoom(pin, false);
      router.push(`/play/lobby/${pin}`);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al unirse a la sala';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl w-full flex flex-col items-center">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Únete a una partida</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl mb-4 text-center w-full">
            {error}
          </div>
        )}
        
        <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
          <Input
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN de juego"
            className="h-16 text-center text-4xl font-bold bg-white text-purple-900 border-none rounded-xl"
            required
          />
          
          <Button 
            type="submit" 
            disabled={pin.length !== 4 || loading}
            size="lg"
            className="h-14 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold text-xl rounded-xl shadow-lg w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
