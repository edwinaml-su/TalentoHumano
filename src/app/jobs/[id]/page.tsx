"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Send, 
  Loader2, 
  Upload,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/recruitment/jobs`); // In a real app, I'd filter or have a specific public route
        const data = await res.json();
        const found = data.find((j: any) => j.id === params.id);
        setJob(found);
      } catch (err) {
        toast.error("Error al cargar la vacante");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: params.id,
          candidateName: name,
          candidateEmail: email,
          candidatePhone: phone
        })
      });

      if (!res.ok) throw new Error("Error al aplicar");

      setSubmitted(true);
      toast.success("¡Aplicación enviada con éxito!");
    } catch (err) {
      toast.error("Error al enviar la aplicación");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center">Vacante no encontrada</div>;

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-orange-200/50 max-w-lg text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">¡Muchas gracias!</h2>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Hemos recibido tu perfil para la posición de <span className="text-orange-600 font-bold">{job.title}</span>. Nuestro equipo de Talento revisará tu información y te contactaremos pronto.
        </p>
        <button 
          onClick={() => router.push("/jobs")}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all"
        >
          VOLVER A VACANTES
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-orange-600 mb-12 transition-colors font-black uppercase text-xs tracking-widest"
        >
          <ChevronLeft size={16} /> Ver todas las vacantes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Job Details */}
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-3 mb-10">
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">{job.location.name}</span>
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">{job.department.name}</span>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Descripción del Cargo</h3>
              <p className="text-slate-600 leading-relaxed mb-8">{job.description}</p>

              <h3 className="text-xl font-bold text-slate-800 mb-4">Requisitos</h3>
              <p className="text-slate-600 leading-relaxed">{job.requirements || "No especificado"}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-10 h-fit">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Aplica ahora</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                <input 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+503 7000-0000"
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-400 transition-all cursor-pointer group bg-slate-50/50">
                <Upload size={32} className="mx-auto mb-3 text-slate-300 group-hover:text-orange-500 transition-colors" />
                <p className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">SUBIR CURRÍCULUM (PDF)</p>
              </div>

              <button 
                disabled={submitting}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                ENVIAR POSTULACIÓN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
