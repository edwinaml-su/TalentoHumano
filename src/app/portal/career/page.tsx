"use client";

import { useState, useEffect } from "react";
import { 
  GitMerge, 
  Target, 
  TrendingUp, 
  Award,
  ChevronRight,
  Star,
  Map
} from "lucide-react";

export default function CareerPathPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Línea de Carrera</h1>
        <p className="text-slate-500 font-medium">Visualiza tu futuro y crecimiento dentro de Inversiones Avante.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Roadmap */}
        <div className="md:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Map size={120} className="text-slate-900" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-10 flex items-center gap-2">
            <TrendingUp size={24} className="text-indigo-600" /> Mi Ruta de Crecimiento
          </h2>

          <div className="space-y-12 relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
            
            <PathStep title="Cargo Actual" subtitle="Analista de Talento Humano" status="current" />
            <PathStep title="Siguiente Nivel" subtitle="Coordinador de Selección" status="next" />
            <PathStep title="Meta a Largo Plazo" subtitle="Jefe de Talento Humano" status="target" />
          </div>
        </div>

        {/* Skills needed */}
        <div className="space-y-8">
          <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-amber-400" size={24} />
              <h3 className="text-lg font-bold">Skills Requeridos</h3>
            </div>
            <div className="space-y-4">
              <SkillBar label="Liderazgo" percent={60} />
              <SkillBar label="Gestión de Proyectos" percent={45} />
              <SkillBar label="Estrategia BI" percent={30} />
            </div>
          </section>

          <section className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">Consejo de Carrera</h3>
            <p className="text-xs text-indigo-700 leading-relaxed mb-4">
              Para alcanzar tu siguiente nivel, te recomendamos completar el curso de "Liderazgo Situacional" disponible en el Centro de Formación.
            </p>
            <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              Ir a Capacitación <ChevronRight size={12} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function PathStep({ title, subtitle, status }: { title: string, subtitle: string, status: 'current' | 'next' | 'target' }) {
  const colors = {
    current: "bg-indigo-600 ring-indigo-100",
    next: "bg-white border-2 border-slate-200",
    target: "bg-slate-50 border-2 border-slate-100"
  };

  return (
    <div className="flex gap-6 items-start relative z-10">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ring-8 ${colors[status]}`}>
        {status === 'current' && <Star size={16} className="text-white" />}
        {status === 'next' && <Target size={16} className="text-indigo-600" />}
        {status === 'target' && <Award size={16} className="text-slate-300" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className={`font-bold ${status === 'current' ? 'text-indigo-600' : 'text-slate-900'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function SkillBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-white">{percent}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
