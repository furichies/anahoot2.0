import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Brain } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 mx-auto mb-4">
          <Brain className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AnnaHoot V2</h1>
      </div>

      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-white">Cargando...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
