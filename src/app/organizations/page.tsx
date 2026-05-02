"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Plus, 
  Building2, 
  MapPin, 
  Globe, 
  MoreVertical, 
  CheckCircle2, 
  ExternalLink,
  Users,
  Building,
  ChevronRight,
  X
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function OrganizationsPage() {
  const [dbOrgs, setDbOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedUnitIds, toggleUnit, isGlobalAdmin } = useOrganization();
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [editingLoc, setEditingLoc] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrgs();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/localization/countries");
      if (res.ok) setCountries(await res.json());
    } catch (e) {}
  };

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setDbOrgs(data);
      }
    } catch (err) {
      console.error("Error fetching orgs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingOrg) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/organizations/${editingOrg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commercialName: editingOrg.commercialName,
          legalName: editingOrg.legalName,
          taxId: editingOrg.taxId,
          countryId: editingOrg.countryId
        })
      });

      if (res.ok) {
        fetchOrgs();
        setEditingOrg(null);
      }
    } catch (err) {
      console.error("Error saving org:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLocEdit = async () => {
    if (!editingLoc) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/locations/${editingLoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingLoc.name })
      });

      if (res.ok) {
        fetchOrgs();
        setEditingLoc(null);
      }
    } catch (err) {
      console.error("Error saving location:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Shell>
      <div className="page-header animate-fade-in flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Estructura Organizacional</h1>
          <p className="subtitle text-slate-500 mt-2 font-medium">
            Gestión centralizada de organizaciones y unidades operativas regionales.
          </p>
        </div>
        {isGlobalAdmin && (
          <button className="btn btn-primary shadow-xl shadow-primary/25 hover:scale-105 transition-all px-8 py-4 rounded-2xl">
            <Plus size={20} />
            <span className="text-sm">Nueva Organización</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4" />
          <p className="font-bold uppercase tracking-widest text-[10px]">Sincronizando...</p>
        </div>
      ) : (
        <div className="org-grid animate-slide-up">
          {dbOrgs.map((org) => {
            const totalEmps = org.locations.reduce((acc: number, loc: any) => acc + (loc._count?.employees || 0), 0);
            
            return (
              <div key={org.id} className="card org-card group transition-all duration-300">
                <div className="org-card-header mb-8">
                  <div className="flex gap-4">
                    <div className="org-icon bg-primary text-white p-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight">{org.commercialName}</h3>
                      <p className="tax-id text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        NIT: {org.taxId}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingOrg({...org})} 
                    className="icon-btn hover:bg-slate-100 p-2.5 rounded-2xl"
                  >
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-8 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      {org.country?.name || "Sin país"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-primary" />
                      {org.country?.currency?.code || "USD"} ({org.country?.currency?.symbol || "$"})
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedes de Operación ({org.locations.length})</span>
                      <button className="text-[10px] font-black text-primary hover:text-primary-focus flex items-center gap-1.5 uppercase transition-colors">
                        Expandir <ChevronRight size={12} />
                      </button>
                    </div>
                    
                    <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                      {org.locations.map((loc: any) => {
                        const isSelected = selectedUnitIds.includes(loc.id);
                        return (
                          <div 
                            key={loc.id} 
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm group/loc
                              ${isSelected 
                                ? 'bg-primary/5 border-primary ring-1 ring-primary/20' 
                                : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 hover:bg-white'}
                            `}
                          >
                            <div 
                              className="flex items-center gap-4 cursor-pointer flex-1"
                              onClick={() => toggleUnit(loc.id)}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                ${isSelected ? 'bg-primary text-white' : 'bg-white text-slate-400 group-hover/loc:text-primary shadow-sm'}`}>
                                <Building size={16} />
                              </div>
                              <div className="overflow-hidden">
                                <div className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{loc.name}</div>
                                <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-wider">
                                  <Users size={12} className="text-slate-300" /> {loc._count?.employees || 0} Colaboradores
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLoc({...loc});
                                }}
                                className="opacity-0 group-hover/loc:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-primary"
                              >
                                <ExternalLink size={14} />
                              </button>
                              <div 
                                onClick={() => toggleUnit(loc.id)}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer
                                ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'border-slate-200 bg-white group-hover/loc:border-primary'}`}>
                                {isSelected && <CheckCircle2 size={14} />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Total Colaboradores</span>
                    <span className="text-xl font-black text-slate-800 leading-none">{totalEmps}</span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    Operación Activa
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingOrg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Editar Organización</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración Operativa</p>
              </div>
              <button onClick={() => setEditingOrg(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid-form space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Comercial</label>
                  <input 
                    className="p-3 border-2 border-slate-100 rounded-2xl bg-white outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                    value={editingOrg.commercialName}
                    onChange={e => setEditingOrg({...editingOrg, commercialName: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Razón Social</label>
                  <input 
                    className="p-3 border-2 border-slate-100 rounded-2xl bg-white outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                    value={editingOrg.legalName}
                    onChange={e => setEditingOrg({...editingOrg, legalName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NIT / Tax ID</label>
                    <input 
                      className="p-3 border-2 border-slate-100 rounded-2xl bg-white outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                      value={editingOrg.taxId}
                      onChange={e => setEditingOrg({...editingOrg, taxId: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">País</label>
                    <select 
                      className="p-3 border-2 border-slate-100 rounded-2xl bg-white outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 appearance-none"
                      value={editingOrg.countryId}
                      onChange={e => setEditingOrg({...editingOrg, countryId: e.target.value})}
                    >
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingOrg(null)}
                className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="btn btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Unit Modal */}
      {editingLoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Editar Unidad</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sede / Centro Operativo</p>
              </div>
              <button onClick={() => setEditingLoc(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre de la Unidad</label>
                <input 
                  className="p-3 border-2 border-slate-100 rounded-2xl bg-white outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                  value={editingLoc.name}
                  onChange={e => setEditingLoc({...editingLoc, name: e.target.value})}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingLoc(null)}
                className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveLocEdit}
                disabled={isSaving}
                className="btn btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .org-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .org-card {
          position: relative;
          padding: 2rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .org-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }

        .org-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-btn-ghost {
          padding: 8px;
          border-radius: 10px;
          color: var(--muted-foreground);
          background: transparent;
        }

        .icon-btn-ghost:hover {
          background: var(--secondary);
          color: var(--foreground);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </Shell>
  );
}
