"use client";

import React, { useEffect, useState } from "react";
import { Plus, Briefcase, Users, GitBranch, Edit2, Trash2, ChevronRight, X, Building2, ChevronDown } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useOrganization } from "@/contexts/OrganizationContext";
import toast, { Toaster } from "react-hot-toast";

interface Position {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department: { name: string, organizationId?: string };
  parentPositionId: string | null;
  parentPosition?: { title: string } | null;
  _count: { employees: number; subordinates: number };
}

interface Department {
  id: string;
  name: string;
  organizationId?: string;
}

const PositionAccordion = ({ 
  position, 
  allPositions, 
  level, 
  onEdit, 
  onDelete 
}: { 
  position: Position, 
  allPositions: Position[], 
  level: number,
  onEdit: (p: Position) => void,
  onDelete: (id: string) => void
}) => {
  const [expanded, setExpanded] = useState(level < 1); // Auto-expand first level
  const children = allPositions.filter(p => p.parentPositionId === position.id);
  const hasChildren = children.length > 0;

  return (
    <div className="animate-fade-in mb-3">
      <div 
        className={`flex items-center justify-between p-4 bg-white border border-slate-100 shadow-sm rounded-2xl hover:border-primary/30 transition-all ${expanded ? 'ring-2 ring-primary/5' : ''}`}
        style={{ marginLeft: `${level * 2}rem` }}
      >
        <div 
          className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 cursor-pointer" 
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          <div className="flex items-center gap-4">
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all ${hasChildren ? 'hover:bg-primary/10 hover:text-primary' : 'opacity-0'}`}
              disabled={!hasChildren}
            >
              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="p-3 shadow-sm bg-primary/5 text-primary rounded-xl">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="flex flex-col flex-1 pl-2 sm:pl-0">
            <span className="font-black text-slate-800 text-lg">{position.title}</span>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{position.department?.name}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <Users size={12} /> {position._count?.employees || 0} Colaboradores
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pl-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(position); }} 
            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            title="Editar Puesto"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(position.id); }} 
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Eliminar Puesto"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="mt-3 relative">
          <div className="absolute left-[39px] top-0 bottom-6 w-px bg-slate-200" style={{ marginLeft: `${level * 2}rem` }} />
          {children.map(child => (
            <PositionAccordion 
              key={child.id} 
              position={child} 
              allPositions={allPositions} 
              level={level + 1} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PositionsPage() {
  const { selectedOrgIds, availableUnits } = useOrganization();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Partial<Position> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posRes, depRes] = await Promise.all([
        fetch("/api/positions"),
        fetch("/api/config/departments")
      ]);
      
      if (!posRes.ok || !depRes.ok) throw new Error("Fetch failed");
      
      setPositions(await posRes.json());
      setDepartments(await depRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const currentOrgId = selectedOrgIds[0] || availableUnits?.[0]?.organizationId;

  // Filter departments by current organization unit
  const filteredDepartments = departments.filter(d => !d.organizationId || selectedOrgIds.includes(d.organizationId) || d.organizationId === currentOrgId);
  const selectedDeptIds = filteredDepartments.map(d => d.id);
  
  // Filter positions by the filtered departments (Unit/Organization filter)
  const filteredPositions = positions.filter(p => selectedDeptIds.includes(p.departmentId));
  
  // Root positions are those without a parent, OR whose parent is not in the current filtered view
  const rootPositions = filteredPositions.filter(p => !p.parentPositionId || !filteredPositions.find(fp => fp.id === p.parentPositionId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const url = editingPosition?.id ? `/api/positions/${editingPosition.id}` : "/api/positions";
    const method = editingPosition?.id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success(editingPosition?.id ? "Puesto actualizado exitosamente" : "Puesto creado exitosamente");
        setIsFormOpen(false);
        setEditingPosition(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar el puesto");
      }
    } catch (err) {
      toast.error("Error de red al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este puesto de la estructura?")) return;
    try {
      const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Puesto eliminado");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar");
      }
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <Shell>
      <Toaster position="top-right" />
      <div className="animate-fade-in p-2">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Mantenimiento de Puestos</h1>
            <p className="text-slate-500 mt-2 text-lg">Define la arquitectura de talento de tu organización.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <a href="/positions/hierarchy" className="btn btn-secondary group border border-slate-200 shadow-sm hover:shadow-md h-[46px] rounded-xl flex items-center justify-center gap-2 px-6 font-bold text-slate-600 bg-white">
              <GitBranch className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
              Ver Organigrama
            </a>
            {!isFormOpen && (
              <button 
                onClick={() => { setEditingPosition(null); setIsFormOpen(true); }}
                className="btn btn-primary shadow-indigo-200 shadow-xl h-[46px] rounded-xl px-6 flex items-center justify-center gap-2 bg-primary text-white font-black hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear Puesto
              </button>
            )}
          </div>
        </header>

        {isFormOpen && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-10 xl:p-12 animate-slide-up relative overflow-hidden">
            <button 
              onClick={() => { setIsFormOpen(false); setEditingPosition(null); }}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                <Briefcase size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {editingPosition ? "Editar Puesto" : "Nuevo Puesto"}
                </h2>
                <p className="text-slate-500 font-medium">Completa los detalles estructurales del cargo y asígnalo a una unidad.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Título del Cargo / Rol</label>
                  <input 
                    name="title" 
                    defaultValue={editingPosition?.title}
                    placeholder="Ej. Gerente de Operaciones"
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                    required 
                  />
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Departamento de la Unidad</label>
                  <select 
                    name="departmentId" 
                    defaultValue={editingPosition?.departmentId}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-slate-700 outline-none appearance-none"
                    required
                  >
                    <option value="">Selecciona el Departamento...</option>
                    {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 translate-y-2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                </div>

                <div className="space-y-2 relative md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Posición Superior Inmediata (Líder Directo)</label>
                  <select 
                    name="parentPositionId" 
                    defaultValue={editingPosition?.parentPositionId || ""}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-slate-700 outline-none appearance-none"
                  >
                    <option value="">Posición Nivel 1 (Ninguno / Director Global)</option>
                    {filteredPositions.filter(p => p.id !== editingPosition?.id).map(p => (
                      <option key={p.id} value={p.id}>{p.title} - {p.department?.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 translate-y-2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Responsabilidades Clave</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingPosition?.description || ""}
                    placeholder="Describe los objetivos clave de esta posición..."
                    className="w-full h-32 p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all font-bold text-slate-700 outline-none resize-none custom-scrollbar"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingPosition(null); }} className="px-8 h-14 bg-slate-50 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-8 h-14 btn btn-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  Guardar Estructura Puesto
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accordion Hierarchy Container */}
        <div className="bg-slate-50/50 p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 mt-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-200/50 text-slate-500 rounded-lg"><Building2 size={20} /></div>
            <h3 className="text-xl font-black text-slate-700">Explorador de Jerarquías</h3>
          </div>
          
          {loading ? (
             <div className="flex flex-col gap-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
             </div>
          ) : rootPositions.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Briefcase size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-700">No hay puestos definidos</h4>
              <p className="text-slate-400 mt-2">Crea una posición superior para iniciar la estructura de la unidad operativa seleccionada.</p>
            </div>
          ) : (
            <div className="w-full">
              {rootPositions.map(pos => (
                <PositionAccordion 
                  key={pos.id} 
                  position={pos} 
                  allPositions={filteredPositions} 
                  level={0} 
                  onEdit={(p) => { setEditingPosition(p); setIsFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
