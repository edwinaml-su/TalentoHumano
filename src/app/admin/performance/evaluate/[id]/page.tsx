"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Star, 
  Send, 
  ChevronLeft, 
  Target, 
  MessageSquare,
  Loader2,
  Trophy
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function EvaluateEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, goalRes] = await Promise.all([
          fetch(`/api/employees-data/${params.id}`), // I need to make sure this returns basic data
          fetch(`/api/performance/goals?employeeId=${params.id}`)
        ]);
        
        const empData = await empRes.json();
        const goalData = await goalRes.json();
        
        setEmployee(empData);
        setGoals(goalData);
      } catch (err) {
        toast.error("Error al cargar datos del empleado");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) return toast.error("Por favor asigne una calificación");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/performance/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: params.id,
          period: "Q1 2026",
          score,
          feedback
        })
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast.success("Evaluación guardada exitosamente");
      setTimeout(() => router.push("/admin/performance"), 1500);
    } catch (err) {
      toast.error("Error al enviar la evaluación");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-8 transition-colors font-bold uppercase text-[10px] tracking-widest"
      >
        <ChevronLeft size={16} /> Volver al Panel
      </button>

      <header className="mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
            {employee.firstName[0]}{employee.firstSurname[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Evaluación de Desempeño</h1>
            <p className="text-slate-500 font-medium">Evaluando a <span className="text-indigo-600 font-bold">{employee.firstName} {employee.firstSurname}</span> · Q1 2026</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Context & Goals */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Cumplimiento de Objetivos</h2>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">{goal.title}</h3>
                    <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-100">PESO: {goal.weight}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{goal.description}</p>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Feedback y Comentarios</h2>
            </div>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all min-h-[200px] placeholder:text-slate-400"
              placeholder="Escriba aquí los puntos fuertes, áreas de mejora y planes de acción para el próximo periodo..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </section>
        </div>

        {/* Right Column: Rating & Submit */}
        <div className="space-y-8">
          <section className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-200">
            <Trophy size={32} className="text-amber-400 mb-6" />
            <h2 className="text-xl font-bold mb-2">Calificación Final</h2>
            <p className="text-indigo-300 text-xs font-medium mb-8 leading-relaxed">
              Seleccione una puntuación basada en el cumplimiento de metas y competencias.
            </p>

            <div className="flex justify-between mb-10">
              {[1, 2, 3, 4, 5].map((val) => (
                <button 
                  key={val}
                  onClick={() => setScore(val)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${
                    score === val 
                    ? "bg-amber-400 text-indigo-900 scale-110 shadow-lg shadow-amber-400/20" 
                    : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              FINALIZAR EVALUACIÓN
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
