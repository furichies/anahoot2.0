'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Trophy } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Question {
  id: number;
  text: string;
  image?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
}

export default function HostGame() {
  const { pin } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersCount, setAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  
  const { 
    status, 
    currentQuestionIndex, 
    updateRoomState, 
    players, 
  } = useGameStore();

  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // handleTimeUp needs to be memoized or just moved inside useEffect to avoid dep cycle, but since it uses state, wrapping in useCallback is best, or simply use it as is but we must remove it from missing dep warning by ignoring it.
  const handleTimeUp = React.useCallback(async () => {
    await supabase.from('rooms').update({ status: 'showing_stats' }).eq('id', pin);
    updateRoomState({ status: 'showing_stats' });
    
    if (channel) {
      await channel.send({ type: 'broadcast', event: 'game:show_stats', payload: {} });
    }
  }, [channel, pin, supabase, updateRoomState]);

  useEffect(() => {
    let activeChannel: RealtimeChannel;
    let timer: NodeJS.Timeout | undefined;

    const setupGame = async () => {
      // 1. Fetch questions
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });
        
      if (qData) {
        setQuestions(qData);
        updateRoomState({ totalQuestions: qData.length });
      }

      // 2. Setup Realtime for answers
      activeChannel = supabase.channel(`room:${pin}`);
      
      activeChannel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'answers', filter: `room_id=eq.${pin}` },
        () => {
          setAnswersCount(prev => prev + 1);
        }
      );

      activeChannel.subscribe();
      setChannel(activeChannel);
      setLoading(false);
    };

    setupGame();

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
      if (timer) clearInterval(timer);
    };
  }, [pin, supabase, updateRoomState]);

  // Timer logic for 'playing' status
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'playing' && timeLeft > 0 && answersCount < players.length) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (status === 'playing' && (timeLeft === 0 || answersCount >= players.length)) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, answersCount, players.length, handleTimeUp]);

  const handleNextQuestion = async () => {
    const isLast = currentQuestionIndex >= questions.length - 1;
    const nextStatus = isLast ? 'leaderboard' : 'playing';
    const nextIndex = isLast ? currentQuestionIndex : currentQuestionIndex + 1;

    setAnswersCount(0);
    setTimeLeft(20);

    await supabase.from('rooms').update({ 
      status: nextStatus, 
      current_question_index: nextIndex 
    }).eq('id', pin);

    updateRoomState({ status: nextStatus, currentQuestionIndex: nextIndex });

    if (channel) {
      await channel.send({ 
        type: 'broadcast', 
        event: isLast ? 'game:leaderboard' : 'game:next_question', 
        payload: { currentQuestionIndex: nextIndex } 
      });
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-900">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-xl font-bold">
            <Users className="w-5 h-5" />
            Respuestas: {answersCount} / {players.length}
          </div>
          <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500 w-20 text-center">
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-purple-100">
        
        {/* Question Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-purple-50">
          <h1 className="text-3xl md:text-5xl font-bold text-purple-950 mb-8 leading-tight">
            {currentQ.text}
          </h1>
          {currentQ.image && (
             <img src={currentQ.image} alt="Question" className="max-h-64 object-contain rounded-xl shadow-md border border-purple-200" />
          )}
        </div>

        {/* Options Area */}
        <div className="w-full md:w-1/2 p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <OptionCard color="bg-pink-500" letter="A" text={currentQ.option_a} isCorrect={status === 'showing_stats' && currentQ.correct_answer === 'A'} showResult={status === 'showing_stats'} />
            <OptionCard color="bg-blue-500" letter="B" text={currentQ.option_b} isCorrect={status === 'showing_stats' && currentQ.correct_answer === 'B'} showResult={status === 'showing_stats'} />
            <OptionCard color="bg-yellow-500" letter="C" text={currentQ.option_c} isCorrect={status === 'showing_stats' && currentQ.correct_answer === 'C'} showResult={status === 'showing_stats'} />
            <OptionCard color="bg-green-500" letter="D" text={currentQ.option_d} isCorrect={status === 'showing_stats' && currentQ.correct_answer === 'D'} showResult={status === 'showing_stats'} />
        </div>
      </div>

      {status === 'showing_stats' && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-purple-100 flex items-center justify-between animate-fade-in">
          <div className="flex-1 mr-6">
            <h3 className="font-bold text-lg text-purple-900 mb-2">Explicación:</h3>
            <p className="text-purple-800">{currentQ.explanation}</p>
          </div>
          <Button 
            onClick={handleNextQuestion}
            size="lg"
            className="h-16 px-8 text-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md"
          >
            {currentQuestionIndex >= questions.length - 1 ? 'Ver Podio' : 'Siguiente Pregunta'}
          </Button>
        </div>
      )}
      
      {status === 'leaderboard' && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
           <Trophy className="w-32 h-32 text-yellow-400 mb-8 animate-bounce" />
           <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
             Fin del Juego
           </h1>
           <p className="text-2xl text-purple-800 mb-12">Veamos los resultados en el panel</p>
           <Button onClick={() => router.push('/host')} size="lg" className="h-16 px-12 text-2xl rounded-2xl">
              Volver al Panel
           </Button>
        </div>
      )}
    </div>
  );
}

function OptionCard({ color, letter, text, isCorrect, showResult }: { color: string, letter: string, text: string, isCorrect: boolean, showResult: boolean }) {
  return (
    <div className={`
      relative rounded-2xl p-6 flex flex-col justify-center shadow-md transition-all duration-300
      ${showResult && !isCorrect ? 'opacity-30 grayscale' : 'opacity-100 scale-100'}
      ${showResult && isCorrect ? 'ring-8 ring-green-400 scale-105 z-10' : ''}
      ${color}
    `}>
      <span className="absolute top-4 left-4 bg-white/20 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl">
        {letter}
      </span>
      <span className="text-white font-bold text-xl lg:text-2xl text-center mt-6">
        {text}
      </span>
    </div>
  );
}
