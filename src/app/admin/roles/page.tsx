"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Shield, 
  Plus, 
  Settings, 
  Trash, 
  Edit,
  Users,
  ShieldAlert
} from "lucide-react";

export default function RolesAdminPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1>Roles y Permisos</h1>
          <p className="subtitle">Definición de perfiles de acceso y seguridad del sistema.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Nuevo Rol</span>
        </button>
      </div>

      <div className="roles-grid">
        {loading ? (
          <div className="loading">Cargando roles...</div>
        ) : roles.map(role => (
          <div key={role.id} className="role-card card glass animate-slide-up">
            <div className="role-card-header">
              <div className="role-icon-box">
                <Shield size={24} />
              </div>
              <div className="role-meta">
                <h3>{role.name}</h3>
                <span className="user-count">
                  <Users size={12} /> {role._count?.users || 0} Usuarios
                </span>
              </div>
            </div>
            
            <p className="role-description">{role.description || "Sin descripción proporcionada."}</p>
            
            <div className="role-permissions-summary">
              <ShieldAlert size={14} />
              <span>Gestionar permisos granulares</span>
            </div>

            <div className="role-card-actions">
              <button className="btn-icon-labeled"><Edit size={14} /> <span>Editar</span></button>
              <button className="btn-icon-labeled delete"><Trash size={14} /> <span>Eliminar</span></button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .subtitle { color: var(--muted-foreground); }
        
        .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        
        .role-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid var(--border); }
        .role-card-header { display: flex; align-items: center; gap: 1rem; }
        
        .role-icon-box { width: 48px; height: 48px; background: hsla(221, 100%, 31%, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .role-meta h3 { margin: 0; font-size: 1.1rem; color: var(--foreground); }
        .user-count { font-size: 0.75rem; color: var(--muted-foreground); display: flex; align-items: center; gap: 4px; }
        
        .role-description { font-size: 0.85rem; color: var(--muted-foreground); line-height: 1.5; min-height: 3em; }
        
        .role-permissions-summary { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--primary); font-weight: 600; padding: 0.5rem; background: hsla(221, 100%, 31%, 0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .role-permissions-summary:hover { background: hsla(221, 100%, 31%, 0.1); }
        
        .role-card-actions { display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); }
        
        .btn-icon-labeled { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0.5rem; background: var(--secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 0.75rem; font-weight: 600; transition: all 0.2s; }
        .btn-icon-labeled:hover { background: var(--border); }
        .btn-icon-labeled.delete:hover { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
        
        .loading { grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--muted-foreground); }
      `}</style>
    </Shell>
  );
}
