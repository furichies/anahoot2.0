import Link from 'next/link';
import { Brain, Sparkles, Presentation, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Logo and title */}
        <div className="mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Brain className="w-16 h-16 md:w-20 md:h-20 text-purple-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Anna<span className="text-yellow-400">Hoot</span> V2
          </h1>
          <p className="text-xl md:text-2xl text-purple-200">
            Experiencia de aprendizaje multijugador síncrona
          </p>
        </div>
        
        {/* Role selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/auth?role=profesor" className="group">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-transparent hover:border-purple-300/50 transition-all duration-300 h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-white h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Presentation className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Soy Profesor</h2>
                <p className="text-purple-200 text-sm">Crear sala web y proyectar preguntas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/auth?role=alumno" className="group">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-transparent hover:border-yellow-400/50 transition-all duration-300 h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-white h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-yellow-400">Soy Alumno</h2>
                <p className="text-purple-200 text-sm">Unirse a una partida con PIN</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Footer */}
        <p className="mt-16 text-purple-300/60 text-sm">
          Plataforma educativa en tiempo real
        </p>
      </div>
    </div>
  );
}
