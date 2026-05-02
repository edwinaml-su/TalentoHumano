"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { Plus, Search, MapPin, Edit2, Trash2, Building2, Wallet, Briefcase, FileSpreadsheet } from "lucide-react";

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    budget: "",
    locationId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ccRes, locRes] = await Promise.all([
        fetch("/api/config/cost-centers"),
        fetch("/api/config/locations")
      ]);
      const ccData = await ccRes.json();
      const locData = await locRes.json();
      
      setCostCenters(ccData.filter((c: any) => c.isActive));
      setLocations(locData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/config/cost-centers/${editingId}` : "/api/config/cost-centers";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ code: "", name: "", description: "", budget: "", locationId: "" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Ocurrió un error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (cc: any) => {
    setEditingId(cc.id);
    setFormData({
      code: cc.code,
      name: cc.name,
      description: cc.description || "",
      budget: cc.budget || "",
      locationId: cc.locationId
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de inactivar este centro de costo?")) return;
    try {
      const res = await fetch(`/api/config/cost-centers/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredData = costCenters.filter(cc => 
    cc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Wallet size={20} />
            </div>
            Centros de Costo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de presupuestos y distribución financiera departamental.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ code: "", name: "", description: "", budget: "", locationId: "" });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Nuevo Centro de Costo
        </button>
      </div>

      <div className="card bg-white p-6 border rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-medium">Cargando centros de costo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map(cc => (
              <div key={cc.id} className="group p-5 rounded-2xl border-2 border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-2 inline-block">
                      {cc.code}
                    </span>
                    <h3 className="font-bold text-slate-800 truncate">{cc.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cc)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(cc.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">
                  {cc.description || "Sin descripción proporcionada."}
                </p>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate">{cc.location?.name || 'Global'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      <span>{cc._count?.employees || 0} Empleados</span>
                    </div>
                    {cc.budget && (
                      <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        ${Number(cc.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{editingId ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete la información financiera de la unidad.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Código *</label>
                  <input 
                    required 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    type="text" 
                    placeholder="Ej. CC-VNT-01"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Presupuesto ($)</label>
                  <input 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 font-mono font-bold text-emerald-700 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Centro *</label>
                <input 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="Ej. Ventas y Comercialización"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 font-bold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unidad Operativa (Sede) *</label>
                <select 
                  required
                  value={formData.locationId}
                  onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 font-bold text-slate-700 transition-all cursor-pointer"
                >
                  <option value="">Seleccione una unidad...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anotaciones</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción operacional..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-sm resize-none h-24 transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2"
                >
                  <Wallet size={18} />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
