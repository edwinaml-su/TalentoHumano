"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { Plus, Trash2, Edit2, Save, X, ShieldCheck, ChevronRight, Settings, ToggleLeft, ToggleRight } from "lucide-react";

interface AfpType {
  id: string;
  name: string;
  code: string | null;
  rate: number;
  isActive: boolean;
}

export default function AfpTypesPage() {
  const [items, setItems] = useState<AfpType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", rate: 7.25, isActive: true });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config/afp-types");
      if (res.ok) setItems(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setFormData({ name: "", code: "", rate: 7.25, isActive: true });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (item: AfpType) => {
    setFormData({ name: item.name, code: item.code ?? "", rate: item.rate * 100, isActive: item.isActive });
    setEditingId(item.id);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError("El nombre es requerido"); return; }
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/config/afp-types/${editingId}` : "/api/config/afp-types";
    const payload = { name: formData.name, code: formData.code || null, rate: formData.rate / 100, isActive: formData.isActive };
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); setError(d?.error ?? "Error al guardar"); return; }
      await fetchData();
      setShowForm(false);
      setEditingId(null);
    } catch { setError("Error de conexión"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta AFP?")) return;
    const res = await fetch(`/api/config/afp-types/${id}`, { method: "DELETE" });
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
          <h1>AFP — Administradoras de Pensiones</h1>
          <p className="subtitle">Configuración de fondos de pensiones con tasas de aportación por empleado.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>Nueva AFP</span>
        </button>
      </div>

      <div className="grid-layout">
        <div className="card glass animate-slide-up">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>AFP</th>
                  <th>Código</th>
                  <th>Tasa Empleado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sin registros. Crea el primero.</td></tr>
                ) : items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-box"><ShieldCheck size={16} /></div>
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.code ? <code className="code-chip">{item.code}</code> : <span className="text-slate-400 text-xs">—</span>}</td>
                    <td><span className="rate-badge">{(item.rate * 100).toFixed(2)}%</span></td>
                    <td>
                      <span className={`status-pill ${item.isActive ? "active" : "inactive"}`}>
                        {item.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="icon-btn"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="icon-btn delete"><Trash2 size={15} /></button>
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
              <h3 className="font-black">{editingId ? "Editar AFP" : "Nueva AFP"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6">
              {error && <div className="error-box mb-4">{error}</div>}
              <div className="form-group mb-4">
                <label>Nombre de la AFP *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: CRECER, CONFIA, IPSFA" />
              </div>
              <div className="form-group mb-4">
                <label>Código Interno</label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Ej: CRE, CON" />
              </div>
              <div className="form-group mb-4">
                <label>Tasa Empleado (%) — Descuento sobre salario</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                  placeholder="7.25"
                />
                <small className="hint">Ingrese el porcentaje. Ej: 7.25 para 7.25%</small>
              </div>
              <div className="form-group mb-6">
                <label>Estado</label>
                <button onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className="toggle-btn">
                  {formData.isActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                  <span>{formData.isActive ? "Activo" : "Inactivo"}</span>
                </button>
              </div>
              <button onClick={handleSave} className="btn btn-primary w-full py-3">
                <Save size={18} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .grid-layout { display: grid; grid-template-columns: ${showForm ? "1fr 380px" : "1fr"}; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; }
        .subtitle { color: var(--muted-foreground); }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.7rem; text-transform: uppercase; color: var(--muted-foreground); background: #f8fafc; }
        .custom-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .icon-box { width: 32px; height: 32px; background: hsla(221, 100%, 31%, 0.12); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .code-chip { background: #f1f5f9; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: #334155; }
        .rate-badge { background: #dbeafe; color: #1d4ed8; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }
        .status-pill { padding: 0.2rem 0.75rem; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
        .status-pill.active { background: #dcfce7; color: #166534; }
        .status-pill.inactive { background: #fee2e2; color: #991b1b; }
        .icon-btn { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; cursor: pointer; color: var(--muted-foreground); }
        .icon-btn:hover { background: #f1f5f9; }
        .icon-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--muted-foreground); }
        .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; background: white; }
        .toggle-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; cursor: pointer; font-size: 0.9rem; }
        .error-box { background: #fee2e2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; }
        .hint { color: var(--muted-foreground); font-size: 0.75rem; display: block; margin-top: 0.3rem; }
      `}</style>
    </Shell>
  );
}
