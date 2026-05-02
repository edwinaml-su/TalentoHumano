"use client";

import { Shell } from "@/components/Shell";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ArrowUpRight,
  ChevronRight
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
