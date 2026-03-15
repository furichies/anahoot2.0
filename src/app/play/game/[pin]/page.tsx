'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

export default function PlayerGame() {
  const { pin } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [userId, setUserId] = useState<string>('');
  
  const { status, updateRoomState } = useGameStore();

  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    let activeChannel: RealtimeChannel;

    const setupPlayerGame = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth');
      setUserId(user.id);

      // Listen for broadcasts from Host
      activeChannel = supabase.channel(`room:${pin}`);
      
      activeChannel.on('broadcast', { event: 'game:next_question' }, (payload) => {
        updateRoomState({ status: 'playing', currentQuestionIndex: payload.currentQuestionIndex });
        setSelectedAnswer(null);
        setIsCorrect(null);
        setPointsEarned(0);
      });

      activeChannel.on('broadcast', { event: 'game:show_stats' }, async () => {
        updateRoomState({ status: 'showing_stats' });
        
        // Fetch result for current player
        if (selectedAnswer) {
            const { data: answer } = await supabase
              .from('answers')
              .select('is_correct, points_earned')
              .eq('room_id', pin)
              .eq('player_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (answer) {
               setIsCorrect(answer.is_correct);
               setPointsEarned(answer.points_earned);
               if (answer.is_correct) {
                 confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
               }
            } else {
               setIsCorrect(false); // Didn't answer
               setPointsEarned(0);
            }
        } else {
            setIsCorrect(false);
            setPointsEarned(0);
        }
      });

      activeChannel.on('broadcast', { event: 'game:leaderboard' }, () => {
        updateRoomState({ status: 'leaderboard' });
      });

      activeChannel.subscribe();
      setChannel(activeChannel);
      setLoading(false);
    };

    setupPlayerGame();

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [pin, router, supabase, updateRoomState, selectedAnswer]);

  const handleAnswer = async (option: string) => {
    if (selectedAnswer || status !== 'playing') return;
    
    setSelectedAnswer(option);
    
    // We fetch the current question ID from rooms table to insert answer properly
    const { data: room } = await supabase.from('rooms').select('current_question_index').eq('id', pin).single();
    const { data: qData } = await supabase.from('questions').select('id').order('id', { ascending: true });
    
    if (room && qData && qData[room.current_question_index]) {
      const questionId = qData[room.current_question_index].id;
      
      // Calculate points locally based on time (simple version: could be driven by DB trigger too)
      // We will insert the answer. The RLS allows players to insert.
      // Note: is_correct and points_earned would ideally be calculated securely server-side,
      // but for V2.0 rapid implementation, we calculate them via a DB trigger or we fetch the correct answer.
      // Easiest is to fetch the correct answer here using an RPC or just let an edge function do it.
      // Because `questions` RLS is public select, we can check it:
      const { data: question } = await supabase.from('questions').select('correct_answer').eq('id', questionId).single();
      
      const correct = question?.correct_answer === option;
      const points = correct ? 1000 : 0; // Simplified points
      
      await supabase.from('answers').insert({
        room_id: pin,
        question_id: questionId,
        player_id: userId,
        selected_option: option,
        is_correct: correct,
        points_earned: points,
        time_spent: 0 // Simplification
      });
      
      // Update room_players score
      if (correct) {
         // Getting current score and adding to it
         const { data: rp } = await supabase.from('room_players').select('score').eq('room_id', pin).eq('player_id', userId).single();
         if (rp) {
            await supabase.from('room_players').update({ score: rp.score + points }).eq('room_id', pin).eq('player_id', userId);
         }
      }
    }
  };

  if (loading) return <Loader2 className="w-12 h-12 text-white animate-spin" />;

  if (status === 'leaderboard') {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-white text-center">
        <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
        <h2 className="text-4xl font-bold mb-4">Fin de la partida</h2>
        <p className="text-xl text-purple-200">¡Mira la pantalla principal para ver el podio!</p>
        <Button onClick={() => router.push('/play')} className="mt-12 bg-white/20 hover:bg-white/30 text-white rounded-full px-8 py-6 text-xl">
           Salir
        </Button>
      </div>
    );
  }

  if (status === 'showing_stats') {
    return (
      <div className={`w-full max-w-sm rounded-[3rem] p-8 mt-12 shadow-2xl transition-all duration-500 transform
        ${isCorrect ? 'bg-green-500 scale-105' : 'bg-red-500 scale-95 opacity-90'}
      `}>
         <div className="flex flex-col items-center justify-center text-white text-center">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-24 h-24 mb-6" />
                <h2 className="text-4xl font-bold mb-2">¡Correcto!</h2>
                <div className="bg-black/20 rounded-full px-6 py-2 mt-4 font-bold text-2xl">
                  +{pointsEarned}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 mb-6" />
                <h2 className="text-4xl font-bold mb-2">¡Incorrecto!</h2>
                <p className="mt-4 text-white/80 text-xl font-medium">Ánimo para la próxima</p>
              </>
            )}
            
            <p className="mt-12 text-sm text-white/60 font-semibold animate-pulse">
              Esperando a la siguiente pregunta...
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col max-w-md mx-auto">
       {selectedAnswer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white">
             <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-lg ring-4 ring-white/10">
               <Loader2 className="w-10 h-10 animate-spin" />
             </div>
             <h3 className="text-2xl font-bold text-center">Respuesta enviada</h3>
             <p className="text-purple-200 mt-2">Esperando al resto de jugadores...</p>
          </div>
       ) : (
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 pb-8">
            <AnswerButton color="bg-pink-500" hover="hover:bg-pink-400" letter="A" onClick={() => handleAnswer('A')} />
            <AnswerButton color="bg-blue-500" hover="hover:bg-blue-400" letter="B" onClick={() => handleAnswer('B')} />
            <AnswerButton color="bg-yellow-500" hover="hover:bg-yellow-400" letter="C" onClick={() => handleAnswer('C')} />
            <AnswerButton color="bg-green-500" hover="hover:bg-green-400" letter="D" onClick={() => handleAnswer('D')} />
          </div>
       )}
    </div>
  );
}

function AnswerButton({ color, hover, letter, onClick }: { color: string, hover: string, letter: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`${color} ${hover} rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2 transition-all duration-200 flex items-center justify-center group border-2 border-white/20 overflow-hidden relative`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
      <span className="text-white text-5xl font-black opacity-30 group-hover:opacity-100 transition-opacity drop-shadow-md">
        {letter}
      </span>
    </button>
  );
}
