"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Clock, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Search, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LogOut,
  LogIn,
  Edit3
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { MonthlyEntryGrid } from "@/components/MonthlyEntryGrid";

export default function AttendancePage() {
  const { selectedUnitIds } = useOrganization();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [showMonthlyGrid, setShowMonthlyGrid] = useState(false);
  
  // Real-time clock for the dashboard
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedUnitIds.length > 0) {
      fetchAttendances();
    }
  }, [currentDate, selectedUnitIds]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const unitsParam = selectedUnitIds.join(',');
      const res = await fetch(`/api/attendance?date=${dateStr}&unitIds=${unitsParam}`);
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50';
      case 'LATE': return 'text-orange-600 bg-orange-50';
      case 'ABSENT': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (date: any) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Shell>
      <div className="attendance-container">
        {/* Header Section */}
        <div className="page-header animate-fade-in">
          <div>
            <h1>Control de Asistencia</h1>
            <p className="subtitle">Monitoreo en tiempo real y gestión de horarios del personal.</p>
          </div>
          <div className="real-time-clock glass">
            <Clock size={24} className="text-primary animate-pulse" />
            <div className="clock-content">
              <span className="time">
                {mounted ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
              </span>
              <span className="date">
                {mounted ? currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : "..."}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="stats-hero animate-slide-up">
          <div className="stat-card glass primary">
            <div className="stat-icon"><UserCheck size={32} /></div>
            <div className="stat-info">
              <span className="label">Presentes Hoy</span>
              <span className="value">{attendances.length}</span>
              <span className="trend positive">Unidades Seleccionadas</span>
            </div>
          </div>
          <div className="stat-card glass warning">
            <div className="stat-icon"><Clock3 size={32} /></div>
            <div className="stat-info">
              <span className="label">Retrasos</span>
              <span className="value">{attendances.filter(a => a.status === 'LATE').length}</span>
              <span className="trend negative">Pendientes de validar</span>
            </div>
          </div>
          <div className="stat-card glass info">
            <div className="stat-icon"><MapPin size={32} /></div>
            <div className="stat-info">
              <span className="label">Ubicaciones</span>
              <span className="value">{selectedUnitIds.length}</span>
              <span className="trend">Activas</span>
            </div>
          </div>
          <div className="stat-card glass alert">
            <div className="stat-icon"><AlertCircle size={32} /></div>
            <div className="stat-info">
              <span className="label">Inconsistencias</span>
              <span className="value">0</span>
              <span className="trend underline">Revisar</span>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="control-bar card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="date-nav flex items-center gap-4">
            <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}>
              <ChevronLeft size={20} />
            </button>
            <div className="current-date-display flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span className="font-bold">
                {mounted ? currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : "Cargando fecha..."}
              </span>
            </div>
            <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar empleado por nombre o código..." />
          </div>

          <div className="actions flex gap-2">
            <button className="btn btn-secondary"><Filter size={18} /><span>Filtros</span></button>
            <button className="btn btn-primary" onClick={() => setShowMonthlyGrid(true)}>
              <Edit3 size={18} />
              <span>Carga de Horas</span>
            </button>
            <button className="btn btn-primary"><Calendar size={18} /><span>Reporte Mensual</span></button>
          </div>
        </div>

        {showMonthlyGrid && (
          <MonthlyEntryGrid 
            unitIds={selectedUnitIds} 
            onClose={() => {
              setShowMonthlyGrid(false);
              fetchAttendances();
            }} 
          />
        )}

        {!showMonthlyGrid && (
        <div className="attendance-grid animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="card list-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Horario (Turno)</th>
                  <th>Entrada (Marcación)</th>
                  <th>Salida (Marcación)</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Cargando registros...</td></tr>
                ) : attendances.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">No hay registros para las unidades seleccionadas.</td></tr>
                ) : attendances.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-info">
                        <div className="avatar-sm">{record.employee.fullName.charAt(0)}</div>
                        <div>
                          <div className="name">{record.employee.fullName}</div>
                          <div className="code">{record.employee.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="shift-info">
                        <div className="shift-name">{record.shift?.name || 'Turno General'}</div>
                        <div className="shift-hours">08:00 AM - 05:00 PM</div>
                      </div>
                    </td>
                    <td>
                      <div className="time-log in">
                        <LogIn size={14} />
                        <span>{formatTime(record.clockIn)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-log out">
                        <LogOut size={14} />
                        <span>{formatTime(record.clockOut)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusColor(record.status)}`}>
                        {record.status === 'PRESENT' && <CheckCircle2 size={12} />}
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={14} />
                        <span>{record.employee.location.name}</span>
                      </div>
                    </td>
                    <td>
                      <button className="icon-btn hover:bg-gray-100 rounded-full p-2">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      <style jsx>{`
        .attendance-container { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .real-time-clock { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid var(--border); }
        .clock-content { display: flex; flex-direction: column; }
        .clock-content .time { font-size: 1.5rem; font-weight: 800; line-height: 1; color: var(--primary); }
        .clock-content .date { font-size: 0.75rem; color: var(--muted-foreground); text-transform: capitalize; }
        .stats-hero { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .stat-card { padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; transition: transform 0.3s ease; }
        .stat-card.primary { background: hsla(221, 100%, 31%, 0.1); color: var(--primary); }
        .stat-card.warning { background: hsla(30, 100%, 50%, 0.1); color: #f59e0b; }
        .stat-card.info { background: hsla(210, 100%, 50%, 0.1); color: #3b82f6; }
        .stat-card.alert { background: hsla(0, 100%, 50%, 0.1); color: #ef4444; }
        .stat-info .value { display: block; font-size: 2rem; font-weight: 800; }
        .control-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-radius: 16px; }
        .search-box { position: relative; width: 350px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted-foreground); }
        .search-box input { width: 100%; padding: 0.6rem 2.5rem; border-radius: 10px; background: var(--secondary); border: 1px solid transparent; }
        .attendance-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .attendance-table th { padding: 1rem; font-size: 0.75rem; text-transform: uppercase; color: var(--muted-foreground); background: hsla(221, 100%, 31%, 0.05); text-align: left; }
        .attendance-table td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--border); }
        .status-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
      `}</style>
    </Shell>
  );
}
