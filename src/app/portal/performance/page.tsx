"use client";

import { useState, useEffect } from "react";
import { 
  Target, 
  MessageSquare, 
  Send, 
  Loader2,
  Trophy,
  AlertCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function EmployeePerformancePage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selfEval, setSelfEval] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // In the portal, the API should filter by the logged-in user
        const [goalRes, reviewRes] = await Promise.all([
          fetch("/api/performance/goals"), // This should return ONLY my goals in portal context
          fetch("/api/performance/reviews") // This should return ONLY my reviews
        ]);
        
        const goalData = await goalRes.json();
        const reviewData = await reviewRes.json();
        
        setGoals(goalData);
        setReviews(reviewData);
      } catch (err) {
        toast.error("Error al cargar datos de desempeño");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelfEvalSubmit = async () => {
    if (!selfEval.trim()) return toast.error("Por favor escriba sus comentarios");
    
    setSubmitting(true);
    try {
      // Find a pending review or create a placeholder for self-eval
      const res = await fetch("/api/performance/self-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: "Q1 2026",
          comments: selfEval
        })
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast.success("Autoevaluación enviada correctamente");
      setSelfEval("");
      // Refresh
      const reviewRes = await fetch("/api/performance/reviews");
      setReviews(await reviewRes.json());
    } catch (err) {
      toast.error("Error al enviar autoevaluación");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Desempeño</h1>
        <p className="text-slate-500 font-medium">Seguimiento de metas personales y autoevaluación.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Goals Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Mis Objetivos Q1</h2>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{goal.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100">PESO: {goal.weight}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">45%</span>
                  </div>
                </div>
              ))}
              {goals.length === 0 && <p className="text-center text-slate-400 py-4 italic">No tienes metas asignadas actualmente.</p>}
            </div>
          </section>

          {/* Self Evaluation Form */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Autoevaluación</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Reflexiona sobre tus logros, desafíos y áreas donde necesitas apoyo durante este periodo.
            </p>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all min-h-[150px] placeholder:text-slate-400"
              placeholder="¿Cómo calificarías tu propio desempeño en los últimos meses?"
              value={selfEval}
              onChange={(e) => setSelfEval(e.target.value)}
            />
            <button 
              onClick={handleSelfEvalSubmit}
              disabled={submitting}
              className="mt-4 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              ENVIAR AUTOEVALUACIÓN
            </button>
          </section>
        </div>

        {/* Reviews History */}
        <div className="space-y-8">
          <section className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-100">
            <Trophy size={32} className="text-amber-400 mb-6" />
            <h2 className="text-xl font-bold mb-6">Historial de Calificaciones</h2>
            
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-t border-white/10 pt-6 first:border-0 first:pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{review.period}</span>
                    <span className="text-2xl font-black text-amber-400">{review.score}/5</span>
                  </div>
                  <p className="text-xs text-indigo-100 line-clamp-3 italic">"{review.feedback}"</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="flex items-center gap-3 text-indigo-300 text-sm">
                  <AlertCircle size={18} />
                  <span>Sin evaluaciones finalizadas aún.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
