"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Briefcase,
  ChevronRight,
  Settings
} from "lucide-react";

export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", departmentId: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [posRes, deptRes] = await Promise.all([
        fetch("/api/config/positions"),
        fetch("/api/config/departments")
      ]);
      if (posRes.ok) setPositions(await posRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.departmentId) { setError("Título y departamento son requeridos"); return; }
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/config/positions/${isEditing}` : "/api/config/positions";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchData();
        setShowForm(false);
        setIsEditing(null);
        setFormData({ title: "", description: "", departmentId: "" });
        setError(null);
      } else {
        const d = await res.json();
        setError(d?.error ?? "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este puesto?")) return;
    const res = await fetch(`/api/config/positions/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d?.error ?? "Error al eliminar"); return; }
    fetchData();
  };

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Settings size={14} />
            <ChevronRight size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Catálogos</span>
          </div>
          <h1>Mantenimiento de Puestos (Cargos)</h1>
          <p className="subtitle">Definición de perfiles, cargos y responsabilidades por departamento.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo Puesto</span>
        </button>
      </div>

      <div className="grid-layout">
        <div className="card glass animate-slide-up">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Título del Puesto</th>
                  <th>Departamento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
                ) : positions.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-box"><Briefcase size={16} /></div>
                        <span className="font-bold">{p.title}</span>
                      </div>
                    </td>
                    <td><span className="dept-pill">{p.department?.name || "Global"}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => { setFormData({ title: p.title, description: p.description || "", departmentId: p.departmentId }); setIsEditing(p.id); setShowForm(true); }} className="icon-btn"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="icon-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="form-container card glass animate-slide-in-right">
            <div className="card-header border-b p-4 flex justify-between items-center">
              <h3 className="font-black">Configurar Puesto</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6">
              {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.75rem 1rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.85rem'}}>{error}</div>}
              <div className="form-group mb-4">
                <label>Título del Puesto</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Analista de Sistemas"
                />
              </div>
              <div className="form-group mb-4">
                <label>Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Responsabilidades..."
                />
              </div>
              <div className="form-group mb-6">
                <label>Departamento</label>
                <select 
                  value={formData.departmentId}
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                  className="select-input"
                >
                  <option value="">Seleccione Departamento...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} className="btn btn-primary w-full py-3" disabled={!formData.title || !formData.departmentId}>
                <Save size={18} />
                <span>Guardar Puesto</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .grid-layout { display: grid; grid-template-columns: ${showForm ? "1fr 400px" : "1fr"}; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.7rem; text-transform: uppercase; color: var(--muted-foreground); background: #f8fafc; }
        .custom-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .icon-box { width: 32px; height: 32px; background: hsla(221, 100%, 31%, 0.1); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .dept-pill { background: #f1f5f9; color: #475569; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--muted-foreground); }
        .form-group input, .form-group textarea, .select-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; background: white; }
      `}</style>
    </Shell>
  );
}
