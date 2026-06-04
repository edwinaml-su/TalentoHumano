"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  Users, 
  Plus, 
  ChevronRight, 
  Loader2,
  Lock,
  Edit2,
  Trash2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch("/api/admin/roles");
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
              <Lock size={10} /> Control de Acceso
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Roles y Permisos</h1>
          <p className="text-slate-500 font-medium">Gestión granular de privilegios y perfiles de usuario.</p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
          <Plus size={20} /> Nuevo Rol
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          roles.map((role: any) => (
            <div key={role.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <ShieldCheck size={24} className="text-indigo-600" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                  <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{role.name}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 h-10 overflow-hidden">{role.description}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Permisos Asignados</span>
                  <span className="text-indigo-600">{role.permissions?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions?.slice(0, 3).map((p: any) => (
                    <span key={p.id} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-bold">
                      {p.action}:{p.subject}
                    </span>
                  ))}
                  {role.permissions?.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold">
                      +{role.permissions.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{role._count?.users || 0} Usuarios</span>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                  Gestionar <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
