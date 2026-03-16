'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Upload, Users, FileText, Loader2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  category: string;
}

export default function HostDashboard({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [questions] = useState(initialQuestions);
  
  // State for Grades tab
  const [grades, setGrades] = useState<{username: string, email: string, correct_answers: number, total_questions: number, grade_10: string}[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const fetchGrades = async () => {
    setLoadingGrades(true);
    try {
      const res = await fetch('/api/grades');
      const data = await res.json();
      if (res.ok) {
        setGrades(data);
      } else {
        alert(data.error);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(msg);
    }
    setLoadingGrades(false);
  };

  // Load grades when tab changes to 'alumnos' or initially if needed, but we rely on the button or simple effect.
  // Instead of an effect, we just have the button for now as requested, but let's load them on mount just in case.
  React.useEffect(() => {
    fetchGrades();
  }, []);

  const handleCreateRoom = async () => {
    if (questions.length === 0) {
      alert('Debes subir preguntas antes de crear una sala.');
      return;
    }
    
    setIsCreatingRoom(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al crear la sala');
      
      router.push(`/host/lobby/${data.room_id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al crear la sala';
      alert(msg);
      setIsCreatingRoom(false);
    }
  };

  return (
    <Tabs defaultValue="crear" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-white/50 border border-purple-100 p-1 shadow-sm">
        <TabsTrigger value="crear" className="text-purple-900 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 rounded-lg">
          <Play className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Partida</span>
        </TabsTrigger>
        <TabsTrigger value="preguntas" className="text-purple-900 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 rounded-lg">
          <Upload className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Preguntas</span>
        </TabsTrigger>
        <TabsTrigger value="alumnos" className="text-purple-900 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 rounded-lg">
          <Users className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Alumnos</span>
        </TabsTrigger>
        <TabsTrigger value="exportar" className="text-purple-900 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 rounded-lg">
          <FileText className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Exportar</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="crear">
        <Card className="border-purple-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-900">Crear Nueva Partida</CardTitle>
            <CardDescription>
              Inicia una nueva sala. Se generará un código PIN de 4 dígitos para los alumnos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Play className="w-12 h-12 text-purple-600 ml-2" />
            </div>
            <p className="text-gray-500 mb-8 text-center max-w-sm">
              Asegúrate de tener la presentación lista. Al crear la sala, podrás ver cómo se conectan los alumnos.
            </p>
            <Button 
              onClick={handleCreateRoom} 
              disabled={isCreatingRoom || questions.length === 0}
              size="lg" 
              className="w-full max-w-sm h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg"
            >
              {isCreatingRoom ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Creando Sala...</>
              ) : (
                'Generar Sala (PIN)'
              )}
            </Button>
            {questions.length === 0 && (
              <p className="text-red-500 text-sm mt-4 font-medium">No hay preguntas disponibles. Sube un archivo JSON primero.</p>
            )}
            <p className="mt-4 text-sm text-purple-600 font-semibold">{questions.length} preguntas pre-cargadas</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preguntas">
        <Card className="border-purple-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-900">Gestión de Preguntas</CardTitle>
            <CardDescription>
              Sube un archivo JSON con las preguntas de la partida. Esto reemplazará las preguntas actuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                 onClick={() => document.getElementById('json-upload')?.click()}>
              <Upload className="w-12 h-12 text-purple-400 mb-4" />
              <p className="text-purple-900 font-medium mb-2">Haz clic para seleccionar archivo JSON</p>
              <p className="text-sm text-purple-600">Formato requerido: Array de objetos con text, option_a...d, correct_answer, explanation, category</p>
              <input 
                id="json-upload" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    
                    const res = await fetch('/api/questions/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ questions: json })
                    });
                    
                    if (res.ok) {
                       alert('Preguntas subidas con éxito.');
                       window.location.reload();
                    } else {
                       const data = await res.json();
                       alert('Error: ' + data.error);
                    }
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Unknown error';
                    alert('Error al procesar el archivo: ' + msg);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alumnos">
        <Card className="border-purple-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-900">Rendimiento por Alumno</CardTitle>
              <CardDescription>Calificaciones de la última sesión (Base 10).</CardDescription>
            </div>
            <Button onClick={fetchGrades} variant="outline" size="sm" className="border-purple-200 text-purple-700">
               {loadingGrades ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Refrescar Notas'}
            </Button>
          </CardHeader>
          <CardContent>
            {loadingGrades ? (
              <div className="flex justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center p-12 text-gray-400">
                No hay calificaciones registradas aún.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Visual Chart (Simple CSS Bars) */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-bold text-purple-900 mb-6">Gráfico de Notas (/10)</h3>
                  <div className="space-y-4">
                    {grades.map((g, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-semibold text-purple-800 truncate" title={g.username}>
                          {g.username}
                        </div>
                        <div className="flex-1 h-6 bg-purple-100 rounded-full overflow-hidden relative">
                           <div 
                             className={`h-full rounded-full ${parseFloat(g.grade_10) >= 5 ? 'bg-green-500' : 'bg-red-500'}`}
                             style={{ width: `${(parseFloat(g.grade_10) / 10) * 100}%` }}
                           />
                        </div>
                        <div className="w-12 text-right font-bold text-gray-700">
                          {g.grade_10}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-purple-100 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-purple-100 text-purple-900 font-bold uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-center">Correctas</th>
                        <th className="px-6 py-4 text-center">Tasa Acierto</th>
                        <th className="px-6 py-4 text-right">Nota / 10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50 bg-white">
                      {grades.map((grade, i) => (
                        <tr key={i} className="hover:bg-purple-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{grade.username}</td>
                          <td className="px-6 py-4 text-gray-500">{grade.email}</td>
                          <td className="px-6 py-4 text-center font-mono">
                            {grade.correct_answers} / {grade.total_questions}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {Math.round((grade.correct_answers / grade.total_questions) * 100)}%
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${parseFloat(grade.grade_10) >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {grade.grade_10}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exportar">
        <Card className="border-purple-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-900">Exportar Calificaciones</CardTitle>
            <CardDescription>Genera un PDF con las notas de todos los alumnos de las sesiones recientes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
             <FileText className="w-16 h-16 text-purple-300 mb-6" />
             <Button size="lg" className="h-14 bg-purple-600 hover:bg-purple-700 text-white" onClick={async () => {
                 try {
                   const res = await fetch('/api/grades');
                   const data = await res.json();
                   if (res.ok && Array.isArray(data) && data.length > 0) {
                      const { jsPDF } = await import('jspdf');
                      const autoTable = (await import('jspdf-autotable')).default;
                      
                      const doc = new jsPDF();
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(20);
                      doc.text("Reporte de Calificaciones - AnnaHoot", 14, 22);
                      
                      autoTable(doc, {
                        startY: 30,
                        head: [['Alumno', 'Email', 'Correctas', 'Total Respuestas', 'Nota / 10']],
                        body: data.map((s: { username: string, email: string, correct_answers: number, total_questions: number, grade_10: string }) => [s.username, s.email, s.correct_answers, s.total_questions, s.grade_10]),
                        theme: 'striped',
                        headStyles: { fillColor: [70, 22, 107] }
                      });
                      
                      doc.save('calificaciones_anahoot.pdf');
                   } else {
                     alert('No hay datos para exportar.');
                   }
                 } catch (e: unknown) {
                   const msg = e instanceof Error ? e.message : 'Unknown error';
                   alert(msg);
                 }
             }}>
               Descargar PDF de Notas
             </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
