"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  FileText,
  Loader2
} from "lucide-react";

const stats = [
  { label: "Total Empleados", value: "1,248", icon: Users, trend: "+12%", color: "blue" },
  { label: "Costo de Nómina", value: "$425,000", icon: DollarSign, trend: "+5.4%", color: "green" },
  { label: "Rotación Mensual", value: "2.4%", icon: TrendingUp, trend: "-0.8%", color: "purple" },
  { label: "Horas Extra", value: "450h", icon: Clock, trend: "+15%", color: "orange" },
];

const recentActivities = [
  { id: 1, type: "CONTRATACION", user: "Carlos Rivera", org: "Logística SA", date: "Hace 2 horas" },
  { id: 2, type: "PAGO", user: "Nómina Quincenal", org: "Tech Solutions", date: "Hace 5 horas" },
  { id: 3, type: "DOCUMENTO", user: "Contrato firmado", org: "Banca SV", date: "Hace 1 día" },
];

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/admin/documents/expiring");
        if (res.ok) {
          setAlerts(await res.json());
        }
      } catch (err) {
        console.error("Error fetching expiring documents:", err);
      } finally {
        setLoadingAlerts(false);
      }
    }
    fetchAlerts();
  }, []);

  return (
    <Shell>
      <div className="dashboard-header animate-fade-in">
        <div>
          <h1>Panel de Control</h1>
          <p className="subtitle">Visualización global de Talento Humano y Nómina</p>
        </div>
        <div className="date-picker glass">
          <span>Marzo 2026</span>
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="stats-grid animate-slide-up">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card stat-card">
              <div className="stat-header">
                <div className={`icon-box ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div className="trend positive">
                  <ArrowUpRight size={16} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="stat-body">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="main-grid animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="card large-card">
          <div className="card-header">
            <h3>Costos por Organización</h3>
            <button className="btn btn-secondary btn-sm">Ver Detalle</button>
          </div>
          <div className="chart-placeholder">
            {/* Here we would integrate a chart library like Recharts or Chart.js */}
            <div className="placeholder-content">
              <span>Gráfico de Distribución de Costos Multi-País</span>
            </div>
          </div>
        </div>

        <div className="card side-card">
          <div className="card-header">
            <h3>Actividad Reciente</h3>
          </div>
          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-info">
                  <span className="activity-user">{act.user}</span>
                  <span className="activity-org">{act.org}</span>
                </div>
                <span className="activity-date">{act.date}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary w-full" style={{ marginTop: "1rem" }}>
            Ver Todas las Auditorías
          </button>
        </div>
      </div>

      {/* Alertas de Vencimiento de Documentación */}
      <div className="card alert-card-container animate-slide-up" style={{ animationDelay: "0.3s", marginTop: "2rem" }}>
        <div className="card-header flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Alertas de Vencimiento de Documentación</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Documentos y certificaciones expirados o por expirar en los próximos 30 días.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-full">
            Control de Vigencia
          </span>
        </div>
        
        {loadingAlerts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rose-600" size={32} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium italic border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
            No hay alertas de vencimiento para los próximos 30 días.
          </div>
        ) : (
          <div className="alerts-list divide-y divide-slate-50">
            {alerts.map((alert: any) => (
              <div key={alert.id} className="alert-item flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.isExpired ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {alert.title} <span className={`text-[10px] font-black uppercase tracking-widest ml-2 ${alert.isExpired ? 'text-rose-500' : 'text-amber-500'}`}>({alert.category})</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Colaborador: <span className="font-semibold text-slate-700">{alert.employeeName}</span> ({alert.employeeCode})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vence el</p>
                    <p className="font-bold text-slate-700 text-xs mt-0.5">
                      {new Date(alert.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    alert.isExpired 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {alert.isExpired ? 'Expirado' : `Vence en ${alert.daysRemaining} días`}
                  </span>

                  <Link href={`/employees/${alert.employeeId}/edit`} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        .subtitle { color: var(--muted-foreground); }

        .date-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-box.blue { background: hsla(210, 100%, 50%, 0.1); color: hsl(210, 100%, 50%); }
        .icon-box.green { background: hsla(140, 100%, 30%, 0.1); color: hsl(140, 100%, 30%); }
        .icon-box.purple { background: hsla(270, 100%, 60%, 0.1); color: hsl(270, 100%, 60%); }
        .icon-box.orange { background: hsla(30, 100%, 50%, 0.1); color: hsl(30, 100%, 50%); }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .trend.positive { color: #10b981; }

        .stat-label { color: var(--muted-foreground); font-size: 0.875rem; }
        .stat-value { font-size: 1.75rem; }

        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-placeholder {
          height: 300px;
          background: var(--secondary);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted-foreground);
          border: 2px dashed var(--border);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child { border-bottom: none; }

        .activity-info {
          display: flex;
          flex-direction: column;
        }

        .activity-user { font-weight: 600; }
        .activity-org { font-size: 0.75rem; color: var(--muted-foreground); }
        .activity-date { font-size: 0.75rem; color: var(--muted-foreground); }

        .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; }
        .w-full { width: 100%; }

        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          
          h1 { font-size: 1.5rem; }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </Shell>
  );
}
