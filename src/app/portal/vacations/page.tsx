"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Loader2,
  CalendarDays
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  daysTaken: number;
  status: string;
  notes?: string;
}

interface AccruedData {
  accruedDays: number;
  takenDays: number;
  availableBalance: number;
}

export default function VacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [balance, setBalance] = useState<AccruedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    notes: ""
  });

  // Simulator: use the first employee ID we can find
  // In a real app, this would come from the auth session
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // Find an employee to simulate (MVP mode)
        const empRes = await fetch("/api/admin/users");
        const users = await empRes.json();
        const firstEmpId = users.find((u: any) => u.employeeId)?.employeeId;
        
        if (firstEmpId) {
          setEmployeeId(firstEmpId);
          await Promise.all([
            fetchVacations(firstEmpId),
            fetchBalance(firstEmpId)
          ]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchVacations(id: string) {
    const res = await fetch(`/api/vacations?employeeId=${id}`);
    const data = await res.json();
    setVacations(data);
  }

  async function fetchBalance(id: string) {
    const res = await fetch(`/api/vacations/accrued?employeeId=${id}`);
    const data = await res.json();
    setBalance(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/vacations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, employeeId })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al solicitar vacaciones");
      }

      toast.success("Solicitud enviada exitosamente");
      setIsModalOpen(false);
      setFormData({ startDate: "", endDate: "", notes: "" });
      
      // Refresh data
      await Promise.all([
        fetchVacations(employeeId),
        fetchBalance(employeeId)
      ]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Vacaciones</h1>
          <p className="text-gray-500 mt-1 text-lg">Consulta tu saldo y solicita tus días de descanso.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          Solicitar Vacaciones
        </button>
      </header>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card-glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <CalendarDays size={24} />
            </div>
            <span className="text-gray-500 font-medium">Días Acumulados</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{balance?.accruedDays || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Total histórico</p>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
            <span className="text-gray-500 font-medium">Días Gozados</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{balance?.takenDays || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Descontados del saldo</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-white/80 font-medium">Saldo Disponible</span>
          </div>
          <p className="text-5xl font-black relative z-10">{balance?.availableBalance || 0}</p>
          <p className="text-xs text-white/60 mt-2 font-bold uppercase tracking-wider relative z-10">Días para solicitar</p>
        </div>
      </div>

      {/* History Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Historial de Solicitudes</h2>
          <div className="flex gap-2">
            <span className="badge badge-pending">Pendiente</span>
            <span className="badge badge-approved">Aprobada</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Período</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Días</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vacations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No tienes solicitudes registradas.
                  </td>
                </tr>
              ) : (
                vacations.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">Solicitado el {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-gray-700">{v.daysTaken} días</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        v.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        v.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {v.status === 'APPROVED' ? 'Aprobada' : v.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-gray-300 hover:text-gray-900 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva Solicitud</h2>
            <p className="text-gray-500 mb-8 font-medium">Selecciona las fechas para tu descanso.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Fecha Inicio</label>
                  <input 
                    type="date" 
                    required
                    className="input-modern"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Fecha Fin</label>
                  <input 
                    type="date" 
                    required
                    className="input-modern"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notas (Opcional)</label>
                <textarea 
                  rows={3}
                  className="input-modern"
                  placeholder="Ej: Viaje familiar..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .card-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
        }

        .input-modern {
          width: 100%;
          background: #f9fafb;
          border: 2px solid transparent;
          padding: 0.85rem 1rem;
          border-radius: 16px;
          font-weight: 600;
          color: #1f2937;
          transition: all 0.2s;
        }

        .input-modern:focus {
          background: white;
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
          outline: none;
        }

        .badge {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
        }

        .badge-pending { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        .badge-approved { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
