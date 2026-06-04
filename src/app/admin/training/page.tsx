"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  Users, 
  Award,
  Clock,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  durationHours: number;
  isMandatory: boolean;
  status: string;
  _count: { enrollments: number };
}

export default function TrainingAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, alertRes] = await Promise.all([
          fetch("/api/training/courses"),
          fetch("/api/admin/training/alerts")
        ]);
        setCourses(await courseRes.json());
        setAlerts(await alertRes.json());
      } catch (err) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 2 Finalizada: Talento & Cultura</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Centro de Formación</h1>
          <p className="text-slate-500 font-medium">Gestión del plan de carrera y cumplimiento normativo.</p>
        </div>

        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
          <Plus size={20} />
          Nuevo Curso
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<BookOpen className="text-purple-600" />} label="Cursos Activos" value={courses.length.toString()} trend="Catálogo" />
        <StatCard icon={<Users className="text-indigo-600" />} label="Enrolamientos" value="142" trend="+15 esta semana" />
        <StatCard icon={<Award className="text-emerald-600" />} label="Certificaciones" value="89" trend="Emitidas" />
        <StatCard icon={<ShieldCheck className={`text-rose-600 ${alerts.length > 0 ? 'animate-pulse' : ''}`} />} label="Alertas Legales" value={alerts.length.toString()} trend="Vencimientos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-900">Catálogo de Capacitación</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {courses.map((course) => (
                <div key={course.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <GraduationCap size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{course.title}</h3>
                        {course.isMandatory && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-tighter rounded-md border border-rose-100">Obligatorio</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <BookOpen size={12} /> {course.category}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-3">
                          <Clock size={12} /> {course.durationHours} Horas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-xl transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Alerts Section */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-t-4 border-t-rose-500">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="text-rose-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Alertas de Vencimiento</h2>
            </div>
            
            <div className="space-y-6">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{alert.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{alert.employee.firstName} {alert.employee.firstSurname}</p>
                    <div className="mt-2 inline-block px-2 py-1 bg-rose-100 text-rose-700 text-[9px] font-black rounded-lg">
                      VENCE: {new Date(alert.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-10">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Cumplimiento al 100%. No hay vencimientos próximos.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-lg font-bold mb-4">Mantenimiento Preventivo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El sistema ha sido configurado para notificar automáticamente a los empleados 30 días antes del vencimiento de sus certificaciones críticas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: any, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{trend}</p>
    </div>
  );
}
