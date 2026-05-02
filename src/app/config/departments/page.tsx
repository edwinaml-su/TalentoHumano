"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ListRestart, 
  Building2,
  Building,
  ChevronRight,
  Settings
} from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [gerencias, setGerencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", organizationId: "", gerenciaId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, orgRes, gerRes] = await Promise.all([
        fetch("/api/config/departments"),
        fetch("/api/organizations"),
        fetch("/api/config/gerencias")
      ]);
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (orgRes.ok) setOrganizations(await orgRes.json());
      if (gerRes.ok) setGerencias(await gerRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/config/departments/${isEditing}` : "/api/config/departments";

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
        setFormData({ name: "", organizationId: "", gerenciaId: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGerencias = gerencias.filter(g => g.organizationId === formData.organizationId);

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Settings size={14} />
            <ChevronRight size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Catálogos</span>
          </div>
          <h1>Mantenimiento de Departamentos</h1>
          <p className="subtitle">Estructura operativa y áreas funcionales de la organización.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo Departamento</span>
        </button>
      </div>

      <div className="grid-layout">
        <div className="card glass animate-slide-up">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nombre del Departamento</th>
                  <th>Gerencia / Unidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
                ) : departments.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-box"><ListRestart size={16} /></div>
                        <span className="font-bold">{d.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-xs text-slate-700">{d.gerencia?.name || "Sin Gerencia"}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">{d.organization?.commercialName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => { setFormData({ name: d.name, organizationId: d.organizationId, gerenciaId: d.gerenciaId || "" }); setIsEditing(d.id); setShowForm(true); }} className="icon-btn"><Edit2 size={16} /></button>
                        <button className="icon-btn delete"><Trash2 size={16} /></button>
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
              <h3 className="font-black">Configurar Departamento</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="form-group mb-4">
                <label>Nombre del Departamento</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Contabilidad"
                />
              </div>
              <div className="form-group mb-4">
                <label>Unidad Operativa (Org)</label>
                <select 
                  value={formData.organizationId}
                  onChange={e => setFormData({...formData, organizationId: e.target.value, gerenciaId: ""})}
                  className="select-input"
                >
                  <option value="">Seleccione Organización...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.commercialName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-6">
                <label>Gerencia Superior</label>
                <select 
                  value={formData.gerenciaId}
                  onChange={e => setFormData({...formData, gerenciaId: e.target.value})}
                  className="select-input"
                  disabled={!formData.organizationId}
                >
                  <option value="">Seleccione Gerencia...</option>
                  {filteredGerencias.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} className="btn btn-primary w-full py-3" disabled={!formData.name || !formData.organizationId}>
                <Save size={18} />
                <span>Guardar Cambios</span>
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
        .icon-box { width: 32px; height: 32px; background: hsla(250, 100%, 31%, 0.1); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--muted-foreground); }
        .form-group input, .select-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; background: white; }
        .select-input:disabled { background: #f1f5f9; cursor: not-allowed; }
      `}</style>
    </Shell>
  );
}
