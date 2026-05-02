"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster } from "react-hot-toast";
import { Shell } from "@/components/Shell";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Building, 
  MoreHorizontal, 
  Edit, 
  Trash,
  CheckCircle,
  XCircle,
  MapPin,
  X,
  Plus,
  Lock,
  User as UserIcon
} from "lucide-react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    roleId: "",
    employeeId: "",
    unitIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, eRes, oRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles"),
        fetch("/api/employees-data"),
        fetch("/api/organizations")
      ]);
      
      const [uData, rData, eData, oData] = await Promise.all([
        uRes.json(), rRes.json(), eRes.json(), oRes.json()
      ]);
      
      setUsers(uData);
      setRoles(rData);
      setEmployees(eData);
      setOrganizations(oData);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.password.length < 8) return;
      
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Usuario creado exitosamente");
        setShowAddModal(false);
        setFormData({ email: "", password: "", roleId: "", employeeId: "", unitIds: [] });
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al crear el usuario");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de red interno");
      console.error(error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          roleId: formData.roleId,
          unitIds: formData.unitIds,
          isActive: selectedUser.isActive
        })
      });
      if (res.ok) {
        toast.success("Usuario actualizado exitosamente");
        setShowEditModal(false);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al actualizar el usuario");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de red interno");
      console.error(error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Usuario eliminado exitosamente");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar el usuario");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de red interno");
      console.error(error);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't show password
      roleId: user.assignments?.[0]?.roleId || "",
      employeeId: user.employeeId || "",
      unitIds: user.assignments?.map((a: any) => a.locationId) || []
    });
    setShowEditModal(true);
  };

  const isPhantomAssignment = (!!formData.roleId !== (formData.unitIds.length > 0));
  const isFormInvalid = !formData.email || (showAddModal && formData.password.length < 8) || isPhantomAssignment;

  return (
    <Shell>
      <Toaster position="top-right" />
      <div className="page-header animate-fade-in relative z-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-2 font-medium">Administración de accesos y asignación de unidades operativas.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => {
          setFormData({ email: "", password: "", roleId: "", employeeId: "", unitIds: [] });
          setShowAddModal(true);
        }}>
          <UserPlus size={18} />
          <span>Crear Usuario</span>
        </button>
      </div>

      <div className="mt-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Usuario / Email</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Rol</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Unidades Asignadas</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">No se encontraron usuarios registrados.</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col shrink-0">
                        <span className="font-black text-slate-700">{user.email}</span>
                        {user.employee && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Colaborador: {user.employee.fullName}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                      <Shield size={14} className="text-primary" />
                      <span className="text-sm">{user.assignments?.[0]?.role?.name || "Sin Rol"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                      {user.assignments?.length > 0 ? (
                        user.assignments.map((a: any) => (
                          <span key={a.locationId} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                            <MapPin size={10} className="text-primary" /> {a.location.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300 italic">Sin unidades asignadas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {user.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all" 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all" 
                        title="Eliminar"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR/EDITAR */}
      {(showAddModal || showEditModal) && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}></div>
          
          <div className="relative w-full max-w-3xl bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in my-auto">
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateUser : handleUpdateUser} className="p-8 sm:p-12 container mx-auto">
              <div className="mb-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                  {showAddModal ? "Nuevo Usuario" : "Editar Usuario"}
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Configura los permisos y accesos del sistema.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Principal</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        required
                        type="email" 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-slate-700" 
                        placeholder="usuario@global.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contraseña</label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors size-5 ${showAddModal && formData.password.length > 0 && formData.password.length < 8 ? 'text-rose-500' : 'text-slate-300 group-focus-within:text-primary'}`} />
                      <input 
                        required={showAddModal}
                        type="password" 
                        className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-slate-700 ${showAddModal && formData.password.length > 0 && formData.password.length < 8 ? 'border-rose-300 focus:border-rose-400 focus:bg-white' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                        placeholder={showEditModal ? "••••••••" : "Mínimo 8 caracteres"}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    {showAddModal && formData.password.length > 0 && formData.password.length < 8 && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 animate-fade-in flex items-center gap-1 mt-1">
                        <XCircle size={10} /> Mínimo 8 caracteres
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Vincular a Colaborador</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                      <select 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none appearance-none transition-all font-bold text-slate-700"
                        value={formData.employeeId}
                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                      >
                        <option value="">Cuenta de Sistema (Sin vínculo)</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Rol en Unidades</label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                      <select 
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none appearance-none transition-all font-bold text-slate-700"
                        value={formData.roleId}
                        onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                      >
                        <option value="">Seleccionar Rol...</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Unidades Operativas Asignadas</label>
                  <div className="grid grid-cols-1 gap-3 p-6 bg-slate-50 rounded-3xl max-h-48 overflow-y-auto custom-scrollbar border-2 border-transparent focus-within:border-primary/10">
                    {organizations.map(org => (
                      <div key={org.id} className="space-y-3">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{org.commercialName}</div>
                        {org.locations.map((loc: any) => (
                          <label key={loc.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-primary/20 transition-all">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary"
                              checked={formData.unitIds.includes(loc.id)}
                              onChange={e => {
                                const newIds = e.target.checked 
                                  ? [...formData.unitIds, loc.id]
                                  : formData.unitIds.filter(id => id !== loc.id);
                                setFormData({ ...formData, unitIds: newIds });
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-700">{loc.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{org.commercialName}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isFormInvalid}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center p-4"
                >
                  <span>{showAddModal ? "Generar Usuario" : "Guardar Cambios"}</span>
                  {isPhantomAssignment && <span className="text-[9px] font-bold text-primary-200 uppercase tracking-widest mt-1">Requiere asignar rol y unidad coordinadamente</span>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      ) : null}

      <style jsx>{`
        .btn-primary { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: 800; font-size: 0.9rem; transition: all 0.2s; box-shadow: 0 4px 12px hsla(221, 100%, 31%, 0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 15px hsla(221, 100%, 31%, 0.25); }
      `}</style>
    </Shell>
  );
}
