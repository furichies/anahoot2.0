'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const AVATARS = ['🦁', '🐼', '🦊', '🐱', '🐶', '🐸', '🦄', '🐨', '🐙', '🦋', '🐢', '🦜', '🌸', '⭐', '🔥', '💎'];

export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultRole = searchParams.get('role') === 'profesor' ? 'profesor' : 'alumno';
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        // Redirect based on role in profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profile?.role === 'profesor') {
          router.push('/host');
        } else {
          router.push('/play');
        }
        
      } else {
        // REGISTER
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username,
              email,
              role: defaultRole,
              avatar,
            });

          if (profileError) throw profileError;
        }

        router.push(defaultRole === 'profesor' ? '/host' : '/play');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.';
      setError(msg); // Changed setSubmitError to setError to match existing state variable
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl text-white">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
        </div>

        {!isLogin && (
          <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/70">Rol seleccionado:</p>
              <p className="font-bold text-lg capitalize text-yellow-400">{defaultRole}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error === 'Invalid login credentials' ? 'Credenciales incorrectas' : error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-purple-200">Nombre de usuario</label>
                <Input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12"
                  placeholder="Ej: AnnaHooter123"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-purple-200">Elige tu avatar</label>
                <div className="grid grid-cols-8 gap-2 bg-black/20 p-3 rounded-xl border border-white/10">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`text-2xl p-1 rounded-lg transition-all ${
                        avatar === emoji 
                          ? 'bg-purple-500 scale-110 shadow-lg' 
                          : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-purple-200">Email</label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-purple-200">Contraseña</label>
            <Input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-bold text-lg shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Registrarse'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-white/70 hover:text-white text-sm transition-colors underline-offset-4 hover:underline"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
