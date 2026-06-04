"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award,
  Loader2,
  ChevronRight,
  PlayCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function EmployeeTrainingPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/training/enrollments");
        const data = await res.json();
        setEnrollments(data);
      } catch (err) {
        toast.error("Error al cargar capacitaciones");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  const active = enrollments.filter(e => e.status !== "COMPLETED");
  const completed = enrollments.filter(e => e.status === "COMPLETED");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Aprendizaje</h1>
        <p className="text-slate-500 font-medium">Potencia tus habilidades y mantente al día con tus certificaciones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Courses */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <PlayCircle className="text-purple-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Cursos en Progreso</h2>
            </div>
            
            <div className="space-y-6">
              {active.map((enrollment) => (
                <div key={enrollment.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-purple-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{enrollment.course.title}</h3>
                        {enrollment.course.isMandatory && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-tighter rounded-md">Obligatorio</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{enrollment.course.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-white text-purple-600 border border-purple-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {enrollment.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">30%</span>
                    </div>
                    <button className="ml-8 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all">Continuar</button>
                  </div>
                </div>
              ))}
              {active.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium italic">No tienes cursos activos en este momento.</p>
                </div>
              )}
            </div>
          </section>

          {/* Completed Courses */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Completados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completed.map((enrollment) => (
                <div key={enrollment.id} className="p-6 border border-slate-50 rounded-2xl bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{enrollment.course.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Finalizado: {new Date(enrollment.completionDate).toLocaleDateString()}</p>
                  </div>
                  <Award size={20} className="text-amber-500" />
                </div>
              ))}
              {completed.length === 0 && (
                <p className="text-center text-slate-400 text-xs italic col-span-2 py-4">Aún no has completado ningún curso.</p>
              )}
            </div>
          </section>
        </div>

        {/* Learning Profile */}
        <div className="space-y-8">
          <section className="bg-purple-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-purple-200">
            <GraduationCap size={32} className="text-purple-300 mb-6" />
            <h2 className="text-xl font-bold mb-2">Mi Perfil Académico</h2>
            <p className="text-purple-300 text-xs font-medium mb-8">Has completado el 65% de tu plan anual de capacitación.</p>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-200 uppercase">Horas Totales</span>
                <span className="text-xl font-black">42h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-200 uppercase">Diplomas</span>
                <span className="text-xl font-black">{completed.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-200 uppercase">Promedio</span>
                <span className="text-xl font-black">9.2</span>
              </div>
            </div>

            <button className="w-full mt-10 bg-white/10 hover:bg-white/20 border border-white/10 py-4 rounded-2xl font-bold text-sm transition-all">
              Ver Certificados
            </button>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recomendado</h3>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Nueva Habilidad</p>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Liderazgo Situacional</h4>
              <button className="text-indigo-600 font-bold text-[10px] uppercase flex items-center gap-1 hover:gap-2 transition-all">
                Explorar Curso <ChevronRight size={12} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
