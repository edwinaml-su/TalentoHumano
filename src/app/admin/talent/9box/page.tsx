"use client";

import { useState, useEffect } from "react";
import { 
  Crown, 
  Target, 
  Zap, 
  Shield, 
  Loader2,
  Users,
  Search,
  Filter,
  Download
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  { id: "Estrella", color: "bg-indigo-600 text-white", icon: <Crown size={20} /> },
  { id: "Alto Potencial", color: "bg-indigo-100 text-indigo-700", icon: <TrendingUpRebrand size={20} /> },
  { id: "Profesional de Élite", color: "bg-indigo-50 text-indigo-600", icon: <Shield size={20} /> },
  { id: "Enigma", color: "bg-amber-100 text-amber-700", icon: <Zap size={20} /> },
  { id: "Columna Vertebral", color: "bg-slate-100 text-slate-700", icon: <Shield size={20} /> },
  { id: "Diligente", color: "bg-slate-50 text-slate-500", icon: <Users size={20} /> },
  { id: "Diamante en Bruto", color: "bg-rose-100 text-rose-700", icon: <Target size={20} /> },
  { id: "Potencial Inconsistente", color: "bg-rose-50 text-rose-500", icon: <Zap size={20} /> },
  { id: "Bajo Desempeño", color: "bg-slate-900 text-white", icon: <XCircleRebrand size={20} /> },
];

function TrendingUpRebrand(props: any) { return <Zap {...props} /> } // Helper
function XCircleRebrand(props: any) { return <Shield {...props} /> } // Helper

export default function NineBoxMatrixPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/talent/9box");
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Error al cargar matriz");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getCellEmployees = (perfRange: [number, number], potRange: [number, number]) => {
    return data.filter(e => 
      e.performance >= perfRange[0] && e.performance <= perfRange[1] &&
      e.potential >= potRange[0] && e.potential <= potRange[1]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 3: Gestión de Sucesión</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Matriz de Talento 9-Box</h1>
          <p className="text-slate-500 font-medium">Clasificación estratégica basada en Desempeño vs Potencial.</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={async () => {
              const res = await fetch("/api/admin/talent/9box/pdi-sync", { method: "POST" });
              const data = await res.json();
              toast.success(data.message);
            }}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all hover:bg-slate-50"
          >
            <Zap size={18} className="text-amber-500" /> Sincronizar PDI
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
            <Download size={18} /> Exportar Matriz
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Matrix Side Legend */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="font-bold text-lg mb-4">¿Cómo leer la matriz?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              El eje vertical mide el **Potencial** de crecimiento y el eje horizontal el **Desempeño** actual.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400"><Crown size={14} /> Estrellas: Líderes del futuro.</div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400"><Shield size={14} /> Columna: El motor estable.</div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400"><Zap size={14} /> Enigmas: Alto potencial por pulir.</div>
            </div>
          </div>
          
          <div className="p-6 bg-white border border-slate-100 rounded-[2rem]">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Filtros Avanzados</h4>
            <div className="space-y-4">
              <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 outline-none">
                <option>Todos los Departamentos</option>
              </select>
              <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 outline-none">
                <option>Ciclo 2026 Q1</option>
              </select>
            </div>
          </div>
        </div>

        {/* The 9-Box Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-40">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 h-[700px]">
              {/* Row 3: High Potential */}
              <MatrixCell title="Enigma" employees={getCellEmployees([0, 3.9], [7, 10])} color="bg-rose-50 border-rose-100" labelColor="text-rose-600" />
              <MatrixCell title="Diamante" employees={getCellEmployees([4, 6.9], [7, 10])} color="bg-amber-50 border-amber-100" labelColor="text-amber-600" />
              <MatrixCell title="Estrella" employees={getCellEmployees([7, 10], [7, 10])} color="bg-indigo-600 border-indigo-700" labelColor="text-white" />

              {/* Row 2: Medium Potential */}
              <MatrixCell title="Inconsistente" employees={getCellEmployees([0, 3.9], [4, 6.9])} color="bg-rose-50/50 border-rose-100" labelColor="text-rose-400" />
              <MatrixCell title="Columna Vertebral" employees={getCellEmployees([4, 6.9], [4, 6.9])} color="bg-slate-100 border-slate-200" labelColor="text-slate-600" />
              <MatrixCell title="Alto Potencial" employees={getCellEmployees([7, 10], [4, 6.9])} color="bg-indigo-100 border-indigo-200" labelColor="text-indigo-600" />

              {/* Row 1: Low Potential */}
              <MatrixCell title="Riesgo" employees={getCellEmployees([0, 3.9], [0, 3.9])} color="bg-slate-900 border-slate-950" labelColor="text-slate-400" />
              <MatrixCell title="Diligente" employees={getCellEmployees([4, 6.9], [0, 3.9])} color="bg-slate-50 border-slate-200" labelColor="text-slate-500" />
              <MatrixCell title="Maestro" employees={getCellEmployees([7, 10], [0, 3.9])} color="bg-emerald-50 border-emerald-100" labelColor="text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixCell({ title, employees, color, labelColor }: { title: string, employees: any[], color: string, labelColor: string }) {
  return (
    <div className={`${color} rounded-[2rem] border p-6 flex flex-col justify-between overflow-hidden relative`}>
      <div className="relative z-10">
        <h3 className={`text-xs font-black uppercase tracking-widest ${labelColor}`}>{title}</h3>
        <p className={`text-[10px] mt-1 font-bold ${labelColor} opacity-70`}>{employees.length} Empleados</p>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-4 relative z-10 max-h-32 overflow-y-auto custom-scrollbar">
        {employees.map(e => (
          <div key={e.id} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-[10px] font-black group cursor-pointer hover:bg-white/40 transition-all" title={e.name}>
            {e.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
        ))}
      </div>
      
      <div className={`absolute bottom-0 right-0 p-4 opacity-10 ${labelColor}`}>
        <Users size={60} />
      </div>
    </div>
  );
}
