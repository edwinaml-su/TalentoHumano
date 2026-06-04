"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  Plus, 
  MessageSquare, 
  Users, 
  BarChart2,
  TrendingUp,
  Loader2,
  ChevronRight,
  Smile,
  Search
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Survey {
  id: string;
  title: string;
  type: string;
  status: string;
  _count: { responses: number };
  createdAt: string;
}

export default function SurveysAdminPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    try {
      const res = await fetch("/api/admin/surveys");
      const data = await res.json();
      setSurveys(data);
    } catch (err) {
      toast.error("Error al cargar encuestas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 3: Retención & eNPS</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clima Organizacional</h1>
          <p className="text-slate-500 font-medium">Escuchando la voz del colaborador para mejorar la fidelización.</p>
        </div>

        <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95">
          <Plus size={20} />
          Crear Encuesta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Heart className="text-rose-600" />} label="eNPS Global" value="72" trend="Excelente" trendColor="text-emerald-500" />
        <StatCard icon={<MessageSquare className="text-blue-600" />} label="Respuestas" value="1,240" trend="+12% mes" trendColor="text-emerald-500" />
        <StatCard icon={<Smile className="text-amber-600" />} label="Satisfacción" value="8.4" trend="Score 0-10" trendColor="text-slate-400" />
        <StatCard icon={<TrendingUp className="text-indigo-600" />} label="Riesgo Fuga" value="Bajo" trend="Predictivo" trendColor="text-emerald-500" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar encuesta..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-rose-600" size={40} />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {surveys.map((survey) => (
              <div key={survey.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <BarChart2 size={24} className="text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{survey.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Users size={12} /> {survey.type}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-3">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participación</p>
                    <p className="font-bold text-slate-900">{survey._count.responses} Respuestas</p>
                  </div>
                  
                  <div className="w-32">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {survey.status}
                    </span>
                  </div>

                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
            {surveys.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">No hay encuestas activas en este momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendColor }: { icon: any, label: string, value: string, trend: string, trendColor: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
      <p className={`text-[10px] font-bold ${trendColor} uppercase tracking-tighter`}>{trend}</p>
    </div>
  );
}
