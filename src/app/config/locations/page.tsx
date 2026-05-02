"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Building2,
  ChevronRight,
  Settings
} from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", organizationId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locRes, orgRes] = await Promise.all([
        fetch("/api/config/locations"),
        fetch("/api/organizations")
      ]);
      if (locRes.ok) setLocations(await locRes.json());
      if (orgRes.ok) setOrganizations(await orgRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/config/locations/${isEditing}` : "/api/config/locations";

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
        setFormData({ name: "", organizationId: "" });
      }
    } catch (err) {
      console.error(err);
    }
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
          <h1>Mantenimiento de Ubicaciones (Sedes)</h1>
          <p className="subtitle">Configuración de los centros de trabajo físicos y sedes regionales.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Nueva Ubicación</span>
        </button>
      </div>

      <div className="grid-layout">
        <div className="card glass animate-slide-up">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nombre de Sede</th>
                  <th>Unidad Operativa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
                ) : locations.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-box"><MapPin size={16} /></div>
                        <span className="font-bold">{l.name}</span>
                      </div>
                    </td>
                    <td><span className="org-pill">{l.organization.commercialName}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => { setFormData({ name: l.name, organizationId: l.organizationId }); setIsEditing(l.id); setShowForm(true); }} className="icon-btn"><Edit2 size={16} /></button>
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
              <h3 className="font-black">Configurar Ubicación</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="form-group mb-4">
                <label>Nombre de la Sede/Ubicación</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Oficina Central, Planta A"
                />
              </div>
              <div className="form-group mb-6">
                <label>Unidad Operativa (Org)</label>
                <select 
                  value={formData.organizationId}
                  onChange={e => setFormData({...formData, organizationId: e.target.value})}
                  className="select-input"
                >
                  <option value="">Seleccione Organización...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.commercialName}</option>
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
        .icon-box { width: 32px; height: 32px; background: hsla(0, 100%, 31%, 0.1); color: #dc2626; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .org-pill { background: #f1f5f9; color: #475569; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--muted-foreground); }
        .form-group input, .select-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; background: white; }
      `}</style>
    </Shell>
  );
}
