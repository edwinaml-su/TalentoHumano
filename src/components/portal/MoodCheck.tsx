"use client";

import { useState, useEffect } from "react";
import { Smile, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function MoodCheck({ employeeName }: { employeeName: string }) {
  const [activeSurvey, setActiveSurvey] = useState<any>(null);
  const [responded, setResponded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSurvey() {
      try {
        const res = await fetch("/api/surveys/responses?type=QUICK_MOOD");
        const data = await res.json();
        setActiveSurvey(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSurvey();
  }, []);

  const handleMoodSubmit = async (score: number) => {
    if (!activeSurvey) return;
    try {
      const res = await fetch("/api/surveys/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: activeSurvey.id, score })
      });
      if (res.ok) {
        setResponded(true);
        toast.success("¡Gracias por compartir cómo te sientes!");
      }
    } catch (err) {
      toast.error("Error al enviar");
    }
  };

  if (loading) return null;
  if (!activeSurvey || responded) return null;

  return (
    <section className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-200 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black mb-1">¿Cómo va tu día, {employeeName}?</h2>
          <p className="text-rose-100 font-medium italic">Tu bienestar es lo más importante para nosotros.</p>
        </div>
        <div className="flex gap-4">
          <MoodButton emoji="😞" onClick={() => handleMoodSubmit(1)} />
          <MoodButton emoji="😐" onClick={() => handleMoodSubmit(4)} />
          <MoodButton emoji="🙂" onClick={() => handleMoodSubmit(7)} />
          <MoodButton emoji="😄" onClick={() => handleMoodSubmit(10)} />
        </div>
      </div>
    </section>
  );
}

function MoodButton({ emoji, onClick }: { emoji: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-14 h-14 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95"
    >
      {emoji}
    </button>
  );
}
