"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  Mail, 
  Phone, 
  FileText,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const STAGES = [
  { id: "NEW", label: "Nuevos", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "SCREENING", label: "Screening", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "INTERVIEW", label: "Entrevistas", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { id: "OFFER", label: "Oferta", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: "HIRED", label: "Contratados", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "REJECTED", label: "Rechazados", color: "bg-rose-50 text-rose-600 border-rose-100" },
];

export default function CandidatesPipelinePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch("/api/recruitment/candidates");
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      toast.error("Error al cargar candidatos");
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("Estado actualizado");
        fetchCandidates();
      }
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 2: Pipeline de Selección</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Candidatos & ATS</h1>
          <p className="text-slate-500 font-medium">Gestión del ciclo de vida del reclutamiento.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar candidato..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
            <Filter size={18} /> Filtros
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[600px]">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {candidates.filter(c => c.status === stage.id).length}
                  </span>
                </div>
                <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={16} /></button>
              </div>

              <div className="space-y-4">
                {candidates.filter(c => c.status === stage.id).map((candidate) => (
                  <div key={candidate.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.candidateName}</h3>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mt-0.5">{candidate.jobPosting.title}</p>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Mail size={12} /> {candidate.candidateEmail}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Clock size={12} /> {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"><FileText size={14} /></button>
                        <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Phone size={14} /></button>
                      </div>
                      
                      <div className="flex gap-1">
                        {stage.id !== 'HIRED' && stage.id !== 'REJECTED' && (
                          <>
                            <button 
                              onClick={() => updateStatus(candidate.id, 'REJECTED')}
                              className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <XCircle size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                const nextIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
                                if (nextIdx < STAGES.length - 1) updateStatus(candidate.id, STAGES[nextIdx].id);
                                else updateStatus(candidate.id, 'HIRED');
                              }}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {candidates.filter(c => c.status === stage.id).length === 0 && (
                  <div className="py-10 border-2 border-dashed border-slate-50 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest text-center">Sin candidatos en esta etapa</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
