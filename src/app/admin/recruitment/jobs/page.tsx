"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Users, 
  Calendar,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  status: string;
  location: { name: string };
  department: { name: string };
  _count: { applications: number };
  createdAt: string;
}

export default function RecruitmentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("/api/recruitment/jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      toast.error("Error al cargar vacantes");
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
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 2: Reclutamiento & ATS</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bolsa de Trabajo</h1>
          <p className="text-slate-500 font-medium">Gestión de vacantes y pipeline de candidatos.</p>
        </div>

        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95">
          <Plus size={20} />
          Publicar Vacante
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Briefcase className="text-orange-600" />} label="Vacantes Abiertas" value={jobs.length.toString()} color="orange" />
        <StatCard icon={<Users className="text-blue-600" />} label="Candidatos Nuevos" value="24" color="blue" />
        <StatCard icon={<ClipboardList className="text-emerald-600" />} label="Entrevistas hoy" value="5" color="emerald" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar vacante..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl hover:bg-white text-slate-400">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-600" size={40} />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <Briefcase size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <MapPin size={12} /> {job.location.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-3">
                        <Users size={12} /> {job.department.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-3">
                        <Calendar size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Candidatos</p>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center font-black text-xs">
                        {job._count.applications}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {job.status}
                    </span>
                  </div>

                  <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-white rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">No hay vacantes publicadas.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
