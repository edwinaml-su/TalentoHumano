"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Shell } from "@/components/Shell";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Clock, 
  Building2, 
  MapPin,
  ChevronRight,
  Settings,
  Power,
  Moon
} from "lucide-react";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriod: number;
  isOvernight?: boolean;
  departments: { id: string, name: string }[];
  locations: { id: string, name: string }[];
}

interface Department {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: "",
    startTime: "08:00",
    endTime: "17:00",
    gracePeriod: 15,
    departments: [],
    locations: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, deptRes, locRes] = await Promise.all([
        fetch("/api/config/shifts"),
        fetch("/api/config/departments"),
        fetch("/api/locations")
      ]);

      if (shiftsRes.ok) setShifts(await shiftsRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (locRes.ok) setLocations(await locRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `/api/config/shifts/${formData.id}` : "/api/config/shifts";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? "Turno actualizado exitosamente" : "Turno creado exitosamente");
        fetchData();
        setShowForm(false);
        setIsEditing(null);
        setFormData({ name: "", startTime: "08:00", endTime: "17:00", gracePeriod: 15, departments: [], locations: [] });
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Ocurrió un error al guardar");
      }
    } catch (err: any) {
      toast.error(err.message || "Error interno del servidor");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este turno? Conservará su historial intacto.")) return;
    try {
      const res = await fetch(`/api/config/shifts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Turno desactivado exitosamente");
        fetchData();
      } else {
        toast.error("Error al desactivar turno");
      }
    } catch (err: any) {
      toast.error(err.message || "Error de red");
      console.error(err);
    }
  };

  const toggleAssociation = (type: 'departments' | 'locations', id: string, name: string) => {
    const current = formData[type] || [];
    const exists = current.find(item => item.id === id);
    if (exists) {
      setFormData({ ...formData, [type]: current.filter(item => item.id !== id) });
    } else {
      setFormData({ ...formData, [type]: [...current, { id, name }] });
    }
  };

  return (
    <Shell>
      <Toaster position="top-right" />
      <>
        <div className="page-header animate-fade-in relative z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Settings size={14} />
              <ChevronRight size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Catálogos</span>
            </div>
            <h1>Turnos y Horarios</h1>
            <p className="subtitle">Configuración de jornadas laborales y asignación por unidad organizativa.</p>
          </div>
          <button 
            onClick={() => {
              setShowForm(true);
              setFormData({ name: "", startTime: "08:00", endTime: "17:00", gracePeriod: 15, departments: [], locations: [] });
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Nuevo Turno</span>
          </button>
        </div>

      <div className="shifts-list card glass animate-slide-up">
        <div className="card-header">
          <h3 className="text-slate-800 font-black">Turnos Definidos</h3>
        </div>
        <div className="table-container">
          <table className="custom-table w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Nombre del Turno</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Horario</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Tolerancia</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Asignaciones</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No hay turnos configurados</td></tr>
              ) : shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Clock size={18} />
                      </div>
                      <span className="font-black text-slate-700">{shift.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-slate-600 font-mono inline-flex items-center gap-2">
                      {shift.startTime} - {shift.endTime}
                      {shift.isOvernight && (
                        <span title="Turno Nocturno">
                          <Moon size={12} className="text-indigo-500" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{shift.gracePeriod} min</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {shift.departments.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-tighter border border-blue-100">{shift.departments.length} Deptos</span>
                      )}
                      {shift.locations.length > 0 && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black uppercase tracking-tighter border border-rose-100">{shift.locations.length} Sedes</span>
                      )}
                      {shift.departments.length === 0 && shift.locations.length === 0 && (
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Global</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setFormData(shift);
                          setShowForm(true);
                          setIsEditing(shift.id);
                        }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all"
                      ><Edit2 size={16} /></button>
                      <button 
                        onClick={() => handleDelete(shift.id)}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-white rounded-xl transition-all"
                        title="Desactivar Turno"
                      ><Power size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowForm(false)}></div>
          
          <div className="relative w-full max-w-xl bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {isEditing ? "Editar Turno" : "Crear Nuevo Turno"}
                </h2>
                <div className="w-12 h-1 bg-primary rounded-full mt-2" />
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Turno</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Administrativo, Operativo..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Inicio</label>
                    <input 
                      type="time" 
                      value={formData.startTime} 
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all font-black text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Fin</label>
                    <input 
                      type="time" 
                      value={formData.endTime} 
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all font-black text-slate-700"
                    />
                  </div>
                </div>

                {formData.startTime && formData.endTime && formData.startTime > formData.endTime && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                      <Moon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest">Turno Nocturno Detectado</h4>
                      <p className="text-[10px] text-indigo-600 font-bold mt-0.5">La hora de salida corresponde al día siguiente.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodo de Gracia (minutos)</label>
                  <input 
                    type="number" 
                    min={0}
                    step={1}
                    value={formData.gracePeriod} 
                    onChange={e => setFormData({...formData, gracePeriod: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest">
                    <Building2 size={16} className="text-primary" />
                    Asignar a Departamentos
                  </h4>
                  <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl max-h-32 overflow-y-auto custom-scrollbar">
                    {departments.map(dept => (
                      <label key={dept.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-primary/20 transition-all">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary h-5 w-5"
                          checked={!!formData.departments?.find(d => d.id === dept.id)}
                          onChange={() => toggleAssociation('departments', dept.id, dept.name)}
                        />
                        <span className="text-xs font-bold text-slate-600">{dept.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest">
                    <MapPin size={16} className="text-primary" />
                    Asignar a Sedes / Ubicaciones
                  </h4>
                  <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl max-h-32 overflow-y-auto custom-scrollbar">
                    {locations.map(loc => (
                      <label key={loc.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-primary/20 transition-all">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary h-5 w-5"
                          checked={!!formData.locations?.find(l => l.id === loc.id)}
                          onChange={() => toggleAssociation('locations', loc.id, loc.name)}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-600">{loc.name}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase">{(loc as any).organization?.commercialName}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!formData.name}
                className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2 text-lg"
              >
                <Save size={20} />
                <span>{isEditing ? "Guardar Cambios" : "Crear Turno"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </>

      <style jsx>{`
        .grid-layout {
          display: grid;
          grid-template-columns: ${showForm ? "1fr 400px" : "1fr"};
          gap: 2rem;
          align-items: start;
        }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .subtitle { color: var(--muted-foreground); font-size: 0.9rem; }
        .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border); }
        .card-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        
        .table-container { overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); background: #f8fafc; }
        .custom-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        
        .shift-icon { width: 32px; height: 32px; background: hsla(221, 100%, 31%, 0.1); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .time-pill { background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 700; font-size: 0.8rem; font-family: monospace; }
        
        .tag { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
        .tag.dept { background: #e0f2fe; color: #0369a1; }
        .tag.loc { background: #fef2f2; color: #991b1b; }
        
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--muted-foreground); }
        .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; }
        .form-group input:focus { border-color: var(--primary); }
        
        .selection-list { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc; }
        .selection-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; cursor: pointer; padding: 0.25rem; }
        .selection-item input { width: auto; }
        
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      `}</style>
    </Shell>
  );
}
