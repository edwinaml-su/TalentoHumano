"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Activity, 
  User, 
  Clock, 
  Database,
  Search,
  Filter,
  Loader2,
  Lock
} from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/audit");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
              <Lock size={10} /> Compliance & Security
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Centro de Auditoría</h1>
          <p className="text-slate-500 font-medium">Registro histórico y trazabilidad de operaciones críticas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AuditStat icon={<Activity className="text-indigo-600" />} label="Eventos Hoy" value={logs.length.toString()} />
        <AuditStat icon={<ShieldCheck className="text-emerald-600" />} label="Integridad" value="100%" />
        <AuditStat icon={<User className="text-blue-600" />} label="Usuarios Activos" value="Admin" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-900">Bitácora de Eventos</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Filtrar por acción..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-500/20" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {log.user?.username?.[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{log.user?.username}</span>
                    </td>
                    <td className="px-8 py-4 font-medium text-slate-600">{log.action}</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <Clock size={14} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function AuditStat({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
