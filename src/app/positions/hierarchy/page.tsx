"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Building2, GitBranch, ZoomIn, ZoomOut, Download, Maximize, Minus, Plus, FileText } from "lucide-react";
import { Shell } from "@/components/Shell";

interface PositionNode {
  id: string;
  title: string;
  department: { name: string };
  parentPositionId?: string | null;
  _count: { employees: number };
  subordinates: PositionNode[];
}

function Branch({ node, depth = 0 }: { node: PositionNode; depth?: number }) {
  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group p-4">
        <div className="relative p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300 w-64 flex flex-col items-start text-left border-l-4 border-l-primary group-hover:scale-[1.02] active:scale-95 cursor-default">
          <div className="w-full flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
              {depth === 0 ? <Building2 size={18} /> : <Users size={18} />}
            </div>
            <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md">
              {depth === 0 ? "Titular" : `Nivel ${depth}`}
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-800 leading-tight mb-1">
            {node.title}
          </h3>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-4 opacity-80">
            {node.department.name}
          </p>

          <div className="w-full pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-slate-300" />
              <span className="text-[10px] font-black text-slate-600">
                {node._count.employees} <span className="text-slate-400 font-bold">Staff</span>
              </span>
            </div>
            {node.subordinates.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black">
                {node.subordinates.length} Reportes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level Transition Line */}
      {node.subordinates.length > 0 && (
        <div className="h-10 w-px bg-slate-200"></div>
      )}

      {/* Children Container */}
      {node.subordinates.length > 0 && (
        <div className="relative flex justify-center gap-8 pt-0">
          {/* Horizontal connecting line */}
          {node.subordinates.length > 1 && (
            <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
          )}

          {node.subordinates.map((sub) => (
            <div key={sub.id} className="relative">
               {/* Vertical line from sibling bar to child */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-10 bg-slate-200"></div>
               <div className="pt-10">
                <Branch node={sub} depth={depth + 1} />
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyPage() {
  const [tree, setTree] = useState<PositionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await fetch("/api/positions");
        if (!res.ok) throw new Error("Failed to fetch");
        const all: any[] = await res.json();
        
        const buildTree = (parentId: string | null): PositionNode[] => {
          return all
            .filter(p => !parentId ? !p.parentPositionId : p.parentPositionId === parentId)
            .map(p => ({
              ...p,
              subordinates: buildTree(p.id)
            }));
        };

        setTree(buildTree(null));
      } catch (err) {
        console.error("Organogram fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.3, prev + delta), 2));
  };

  return (
    <Shell>
      <div className="min-h-full animate-fade-in relative flex flex-col h-screen max-h-screen">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div className="p-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Estructura Organizacional</h1>
            <p className="text-slate-500 mt-2 font-medium">Líneas de mando y arquitectura de jerarquía institucional.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
              <span>Exportar PDF</span>
            </button>
            <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm">
              <button 
                onClick={() => handleZoom(-0.1)}
                className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                title="Alejar"
              >
                <Minus size={20} />
              </button>
              <span className="w-16 text-center text-sm font-black text-slate-700">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => handleZoom(0.1)}
                className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                title="Acercar"
              >
                <Plus size={20} />
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1" />
              <button 
                onClick={() => setZoom(1)}
                className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                title="Resetear"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-12 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Cargando organigrama...</p>
            </div>
          ) : (
            <div 
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="flex justify-center min-w-max"
            >
              {tree.length > 0 ? (
                <div className="flex flex-col items-center">
                  {tree.map(root => (
                    <Branch key={root.id} node={root} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 text-lg font-medium">No se han definido puestos raíz. Crea uno en el mantenimiento.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
