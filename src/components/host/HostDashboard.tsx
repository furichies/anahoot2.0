'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Upload, Users, FileText, Loader2, LayoutDashboard, UserPlus, Trash2, ChevronRight, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';

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
  const [grades, setGrades] = useState<{username: string, email: string, correct_answers: number, total_questions: number, grade_10: string, room_id: string}[]>([]);
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

  const [activeSection, setActiveSection] = useState<'crear' | 'preguntas' | 'alumnos' | 'gestion_usuarios' | 'exportar'>('crear');

  // State for Gestion Usuarios
  const [students, setStudents] = useState<{id: string, username: string, email: string}[]>([]);
  const [newStudent, setNewStudent] = useState({ email: '', username: '', password: '' });
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  const supabase = createClient();

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'alumno')
      .order('created_at', { ascending: false });
    
    if (data) setStudents(data as {id: string, username: string, email: string}[]);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingStudent(true);
    try {
      // Create user via Supabase Auth (standard signup)
      // Note: This signs them up but doesn't log the host out because we use the internal client
      const { error } = await supabase.auth.signUp({
        email: newStudent.email,
        password: newStudent.password,
        options: {
          data: {
            username: newStudent.username,
            role: 'alumno',
            avatar: '👤'
          }
        }
      });

      if (error) throw error;
      alert('Alumno creado con éxito');
      setNewStudent({ email: '', username: '', password: '' });
      fetchStudents();
    } catch (error: unknown) {
      handleCreateStudentCatch(error);
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este alumno?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      
      setStudents(students.filter(s => s.id !== id));
      alert('Alumno eliminado del sistema');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      alert(msg);
    }
  };

  React.useEffect(() => {
    if (activeSection === 'gestion_usuarios') {
      fetchStudents().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleCreateStudentCatch = (error: unknown) => {
    const msg = error instanceof Error ? error.message : 'Error al crear alumno';
    alert(msg);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: Exclude<typeof activeSection, undefined>, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeSection === id 
          ? 'bg-purple-100 text-purple-900 shadow-sm font-bold' 
          : 'text-purple-600 hover:bg-purple-50 hover:text-purple-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeSection === id ? 'text-purple-700' : 'text-purple-400'}`} />
      <span className="text-sm">{label}</span>
      {activeSection === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-50/50 border-r border-purple-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2 text-purple-900">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">Host Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem id="crear" icon={Play} label="Nueva Partida" />
          <SidebarItem id="preguntas" icon={Upload} label="Preguntas" />
          <SidebarItem id="alumnos" icon={Users} label="Calificaciones" />
          <SidebarItem id="gestion_usuarios" icon={UserPlus} label="Gestión Alumnos" />
          <SidebarItem id="exportar" icon={FileText} label="Exportar Reportes" />
        </nav>

        <div className="mt-auto pt-6 border-t border-purple-100">
          <button 
            onClick={() => router.push('/auth/signout')}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-8 md:p-12 overflow-y-auto max-h-[800px]">
        {activeSection === 'crear' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-purple-950 mb-2">Crear Nueva Partida</h1>
            <p className="text-purple-600 mb-10">Inicia una sala y genera el código PIN para tus alumnos.</p>
            
            <div className="bg-purple-50 rounded-[2rem] border border-purple-100 p-12 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl ring-8 ring-purple-100">
                <Play className="w-12 h-12 text-purple-600 ml-2" />
              </div>
              <Button 
                onClick={handleCreateRoom} 
                disabled={isCreatingRoom || questions.length === 0}
                className="w-full max-w-sm h-16 text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-2xl rounded-2xl"
              >
                {isCreatingRoom ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : 'Generar PIN Sala'}
              </Button>
              <p className="mt-8 text-sm font-medium text-purple-500 flex items-center gap-2">
                <Upload className="w-4 h-4" /> {questions.length} preguntas pre-cargadas
              </p>
            </div>
          </div>
        )}

        {activeSection === 'preguntas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-purple-950 mb-2">Repositorio de Preguntas</h1>
            <p className="text-purple-600 mb-10">Sube tus archivos JSON para actualizar el banco de preguntas.</p>
            
            <div 
              className="group border-4 border-dashed border-purple-100 rounded-[2.5rem] p-16 flex flex-col items-center justify-center bg-purple-50/30 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer"
              onClick={() => document.getElementById('json-upload')?.click()}
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-purple-500" />
              </div>
              <p className="text-xl font-bold text-purple-900 mb-2">Haz clic para buscar</p>
              <p className="text-purple-500 text-center max-w-xs">Arrastra aquí tu archivo .json o búscalo en tu ordenador</p>
              <input id="json-upload" type="file" accept=".json" className="hidden" onChange={async (e) => {
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
                  if (res.ok) { window.location.reload(); } else { alert('Error al subir'); }
                } catch { alert('Formato inválido'); }
              }} />
            </div>
          </div>
        )}

        {activeSection === 'alumnos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-purple-950">Calificaciones</h1>
                <p className="text-purple-600">Rendimiento escolar basado en las partidas jugadas.</p>
              </div>
              <Button onClick={fetchGrades} variant="ghost" className="text-purple-600 hover:bg-purple-50">
                {loadingGrades ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Actualizar Datos'}
              </Button>
            </div>

            {loadingGrades ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-200" /></div>
            ) : grades.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center bg-purple-50 rounded-[2rem] border border-purple-100">
                <Users className="w-12 h-12 text-purple-200 mb-4" />
                <p className="text-purple-300 font-bold italic">No hay registros de juego todavía</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-6">Promedio de Clase</h3>
                  <div className="space-y-5">
                    {grades.map((g, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium opacity-80">{g.username}</span>
                          <span className="font-bold">{g.grade_10} / 10</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${parseFloat(g.grade_10) >= 5 ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${(parseFloat(g.grade_10) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-purple-100 rounded-[2rem] shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-purple-50 text-purple-900 text-xs font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Partida (PIN)</th>
                        <th className="px-8 py-5">Estudiante</th>
                        <th className="px-8 py-5">Email</th>
                        <th className="px-8 py-5 text-center">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {grades.map((grade, i) => (
                        <tr key={i} className="hover:bg-purple-50/50 transition-colors">
                          <td className="px-8 py-5 font-mono text-purple-600 bg-purple-50/20">{grade.room_id}</td>
                          <td className="px-8 py-5 font-bold text-purple-950">{grade.username}</td>
                          <td className="px-8 py-5 text-purple-600 text-sm">{grade.email}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black ${parseFloat(grade.grade_10) >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          </div>
        )}

        {activeSection === 'gestion_usuarios' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div>
              <h1 className="text-3xl font-black text-purple-950">Gestión de Alumnos</h1>
              <p className="text-purple-600">Registra nuevas cuentas o elimina accesos.</p>
            </div>

            <Card className="bg-purple-50/50 border-purple-100 rounded-[2rem] shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Añadir Alumno al Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-purple-900">Usuario</label>
                    <input 
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 outline-purple-500" 
                      placeholder="Nombre de usuario" 
                      value={newStudent.username}
                      onChange={e => setNewStudent({...newStudent, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-purple-900">Email</label>
                    <input 
                      type="email"
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 outline-purple-500" 
                      placeholder="correo@ejemplo.com" 
                      value={newStudent.email}
                      onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-purple-900">Contraseña</label>
                    <input 
                      type="password"
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 outline-purple-500" 
                      placeholder="******" 
                      value={newStudent.password}
                      onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isCreatingStudent} className="md:col-start-3 bg-purple-600 rounded-xl h-12">
                    {isCreatingStudent ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Alumno'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
               <h3 className="text-xl font-bold text-purple-950">Alumnos Registrados</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map(s => (
                    <div key={s.id} className="bg-white border border-purple-50 p-5 rounded-[1.5rem] shadow-sm flex items-center justify-between group hover:border-purple-200 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl">👤</div>
                          <div>
                             <p className="font-bold text-purple-900">{s.username}</p>
                             <p className="text-xs text-purple-400">{s.email}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleDeleteStudent(s.id)}
                         className="p-3 text-purple-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeSection === 'exportar' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-purple-950 mb-2">Exportar Reportes</h1>
            <p className="text-purple-600 mb-10">Descarga los resultados en PDF para el historial académico.</p>
            
            <div className="bg-purple-50 rounded-[3rem] p-16 flex flex-col items-center border border-purple-100">
               <FileText className="w-24 h-24 text-purple-200 mb-8" />
               <Button size="lg" className="h-16 px-12 text-xl font-bold bg-purple-900 rounded-2xl" onClick={async () => {
                  try {
                    const res = await fetch('/api/grades');
                    const data = await res.json();
                    if (res.ok && Array.isArray(data) && data.length > 0) {
                       const { jsPDF } = await import('jspdf');
                       const autoTable = (await import('jspdf-autotable')).default;
                       const doc = new jsPDF();
                       doc.setFont("helvetica", "bold"); doc.setFontSize(22);
                       doc.text("Reporte Académico AnnaHoot", 14, 25);
                       doc.setFontSize(10); doc.setTextColor(150);
                       doc.text(`Generado el ${new Date().toLocaleString()}`, 14, 32);
                       
                       autoTable(doc, {
                         startY: 40,
                         head: [['PIN', 'Estudiante', 'Correctas', 'Nota / 10']],
                         body: data.map(s => [s.room_id, s.username, `${s.correct_answers}/${s.total_questions}`, s.grade_10]),
                         headStyles: { fillColor: [88, 28, 135], fontStyle: 'bold' },
                         alternateRowStyles: { fillColor: [250, 245, 255] },
                         margin: { top: 40 }
                       });
                       doc.save('reporte_calificaciones_anahoot.pdf');
                    }
                  } catch { alert('Error al generar PDF'); }
               }}>
                 Generar Reporte PDF Final
               </Button>
               <p className="mt-6 text-sm text-purple-400">Incluye promedios de todas las sesiones registradas.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
