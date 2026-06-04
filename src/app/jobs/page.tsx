"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  ArrowRight,
  Search,
  Loader2,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/recruitment/jobs"); // Reusing the same API
        const data = await res.json();
        setJobs(data.filter((j: any) => j.status === "OPEN"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Header */}
      <nav className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Oportunidades Avante</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">ACCESO EMPLEADOS</Link>
      </nav>

      <main className="max-w-5xl mx-auto py-20 px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Únete a nuestro equipo</h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Forma parte de la transformación digital líder en la región. Buscamos el mejor talento para Inversiones Avante.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-16">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cargo o palabra clave..." 
            className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-14 pr-6 text-slate-900 shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Link 
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-200/20 transition-all group flex flex-col md:flex-row justify-between items-center gap-8"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center group-hover:bg-orange-600 transition-all duration-500">
                    <Briefcase size={28} className="text-orange-600 group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{job.title}</h3>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                        <MapPin size={14} /> {job.location.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                        <Building2 size={14} /> {job.department.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 group-hover:bg-orange-600 px-6 py-3 rounded-2xl transition-all duration-500">
                  <span className="text-sm font-black text-slate-900 group-hover:text-white">APLICAR AHORA</span>
                  <ArrowRight size={18} className="text-orange-600 group-hover:text-white transition-all" />
                </div>
              </Link>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 font-medium italic">No hay vacantes abiertas en este momento. ¡Vuelve pronto!</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
        © 2026 Inversiones Avante · Talento & Cultura
      </footer>
    </div>
  );
}
