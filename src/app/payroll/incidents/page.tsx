"use client";

import React, { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  Plus, 
  Search,
  ChevronRight,
  AlertCircle,
  Save,
  Trash2,
  FileText,
  TrendingUp,
  Percent,
  MapPin,
  CalendarDays,
  Briefcase,
  History
} from "lucide-react";

const INCIDENT_GROUPS = [
  {
    title: "Ingresos y Ajustes",
    incidents: [
      { id: "REINTEGRO", label: "Reintegros", fields: ["date", "amount"] },
      { id: "SEGUNDA_PLAZA", label: "Segundas Plazas", fields: ["amount"] },
      { id: "BONO", label: "Bonos", fields: ["amount"] },
      { id: "COMISION", label: "Comisiones", fields: ["amount"] },
      { id: "VIATICOS", label: "Viáticos", fields: ["amount"] },
    ]
  },
  {
    title: "Incapacidades y Ausencias",
    incidents: [
      { id: "INCAPACIDAD_ISSS", label: "ISSS (Incapacidad)", fields: ["quantity", "amount"] },
      { id: "AUSENCIA_INJUSTIFICADA", label: "Días Ausentes Injustificados", fields: ["quantity", "amount"] },
      { id: "LLEGADA_TARDE", label: "Llegadas Tarde", fields: ["amount"] },
    ]
  },
  {
    title: "Vacaciones y Festividades",
    incidents: [
      { id: "VACACIONES_GOCE", label: "Goce de Vacaciones", fields: ["quantity", "amount"] },
      { id: "VACACIONES_PRIMA", label: "Prima de Vacaciones", fields: ["amount"] },
      { id: "FESTIVIDAD_DIA", label: "Días Festivos", fields: ["quantity", "amount"] },
      { id: "FESTIVIDAD_NOCHE", label: "Nocturnidad Festiva", fields: ["quantity", "amount"] },
      { id: "FESTIVIDAD_MONTO", label: "Total Festividades", fields: ["amount"] },
    ]
  },
  {
    title: "Horas Extra y Recargos",
    incidents: [
      { id: "EXTRA_DIURNA", label: "Horas Extras Diurnas", fields: ["quantity", "amount"] },
      { id: "EXTRA_NOCTURNA", label: "Horas Extras Nocturnas", fields: ["quantity", "amount"] },
      { id: "NOCTURNIDAD", label: "Nocturnidad", fields: ["quantity", "amount"] },
      { id: "DIA_DESCANSO", label: "Días de Descanso", fields: ["quantity", "amount"] },
      { id: "REGENCIA", label: "Regencias", fields: ["amount"] },
      { id: "HORA_ADICIONAL", label: "Horas Adicionales", fields: ["quantity", "amount"] },
    ]
  }
];

export default function IncidentManagementPage() {
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [currentIncidents, setCurrentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [processedEmployees, setProcessedEmployees] = useState<Set<string>>(new Set());
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedRunId) {
      fetchIncidents();
    }
  }, [selectedEmployee, selectedRunId]);

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const fetchData = async () => {
    try {
      const [runsRes, empRes] = await Promise.all([
        fetch("/api/payroll-runs?status=OPEN"),
        fetch("/api/employees-data")
      ]);
      const runsData = await runsRes.json();
      const empData = await empRes.json();
      setPayrollRuns(runsData);
      setEmployees(empData);
      if (runsData.length > 0) setSelectedRunId(runsData[0].id);
      
      // Load processed status from localStorage for demo/session persistence
      const saved = localStorage.getItem(`processed_${selectedRunId || 'current'}`);
      if (saved) setProcessedEmployees(new Set(JSON.parse(saved)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProcessed = (empId: string) => {
    const newProcessed = new Set(processedEmployees);
    if (newProcessed.has(empId)) {
      newProcessed.delete(empId);
    } else {
      newProcessed.add(empId);
    }
    setProcessedEmployees(newProcessed);
    localStorage.setItem(`processed_${selectedRunId}`, JSON.stringify(Array.from(newProcessed)));
  };

  const handleBulkProcess = (markAs: 'PROCESSED' | 'PENDING') => {
    const newProcessed = new Set(processedEmployees);
    selectedEmployeeIds.forEach(id => {
      if (markAs === 'PROCESSED') {
        newProcessed.add(id);
      } else {
        newProcessed.delete(id);
      }
    });
    setProcessedEmployees(newProcessed);
    localStorage.setItem(`processed_${selectedRunId}`, JSON.stringify(Array.from(newProcessed)));
    setSelectedEmployeeIds(new Set());
  };

  const toggleEmployeeSelection = (empId: string) => {
    const newSelected = new Set(selectedEmployeeIds);
    if (newSelected.has(empId)) {
      newSelected.delete(empId);
    } else {
      newSelected.add(empId);
    }
    setSelectedEmployeeIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.size === filteredEmployees.length) {
      setSelectedEmployeeIds(new Set());
    } else {
      setSelectedEmployeeIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`/api/payroll/incidents?payrollRunId=${selectedRunId}&employeeId=${selectedEmployee.id}`);
      const data = await res.json();
      setCurrentIncidents(data);
      
      // Auto-mark as processed if they have incidents
      if (data.length > 0 && !processedEmployees.has(selectedEmployee.id)) {
        toggleProcessed(selectedEmployee.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveIncident = async (type: string, data: any) => {
    try {
      const res = await fetch("/api/payroll/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type,
          payrollRunId: selectedRunId,
          employeeId: selectedEmployee.id
        })
      });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Shell>
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Incidencias de Nómina</h1>
          <p className="text-slate-500 font-medium">Registro manual de ajustes y novedades para el periodo actual.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Periodo de Nómina Activo</label>
            <select 
              className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
            >
              {payrollRuns.map(run => (
                <option key={run.id} value={run.id}>
                  {run.payrollType} - {new Date(run.startDate).toLocaleDateString()} al {new Date(run.endDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Employee Sidebar - Hidden when employee selected */}
        {!selectedEmployee && (
          <div className="col-span-4 flex flex-col gap-4 animate-in slide-in-from-left duration-300">
            <div className="card glass p-4 rounded-3xl border-slate-100 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar empleado..." 
                  className="w-full bg-slate-50/50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold tracking-tight outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Multi-select header */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                  />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Todos</span>
                </div>
                {selectedEmployeeIds.size > 0 && (
                  <div className="flex gap-2 animate-in zoom-in duration-200">
                    <button 
                      onClick={() => handleBulkProcess('PROCESSED')}
                      className="text-[9px] font-black bg-emerald-500 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                    >
                      FINALIZAR ({selectedEmployeeIds.size})
                    </button>
                    <button 
                      onClick={() => handleBulkProcess('PENDING')}
                      className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      RESET
                    </button>
                  </div>
                )}
              </div>
              
              <div className="employee-list max-h-[600px] overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                {filteredEmployees.map(emp => {
                  const isProcessed = processedEmployees.has(emp.id);
                  const isSelected = selectedEmployeeIds.has(emp.id);
                  return (
                    <div 
                      key={emp.id}
                      className={`group flex items-center gap-3 p-2 rounded-2xl transition-all border-2 ${isSelected ? 'border-primary/20 bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleEmployeeSelection(emp.id)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 cursor-pointer transition-all ml-2"
                      />
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="flex-1 flex items-center gap-4 text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${isProcessed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-bold truncate text-slate-700">{emp.fullName}</p>
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{emp.employeeCode} • {emp.position?.title}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 mr-2">
                          <ChevronRight size={16} className="text-slate-300" />
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${isProcessed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {isProcessed ? 'OK' : 'PEND'}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Incident Form Area */}
        <div className={`${selectedEmployee ? 'col-span-12' : 'col-span-8'} flex flex-col gap-6 transition-all duration-500`}>
          {!selectedEmployee ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[40px] p-12 text-center text-slate-400">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
                <Users size={40} className="text-slate-200" />
              </div>
              <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Selecciona un empleado para comenzar</p>
              <p className="text-sm font-medium max-w-xs mt-2">Podrás registrar ausencias, horas extra, bonos y otros ajustes para la nómina actual.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="card glass p-8 rounded-[40px] border-slate-100 mb-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex gap-6 items-center">
                    <button 
                      onClick={() => setSelectedEmployee(null)}
                      className="group flex flex-col items-center justify-center w-20 h-20 bg-white border-2 border-slate-100 rounded-3xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                    >
                      <History size={24} className="rotate-180 mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Volver</span>
                    </button>
                    <div>
                      <div className="flex items-center gap-4 mb-1">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Editor de Incidencias</h2>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${processedEmployees.has(selectedEmployee.id) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {processedEmployees.has(selectedEmployee.id) ? 'PROCESADO' : 'PENDIENTE DE REVISIÓN'}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                          <Users size={14} className="text-primary" /> {selectedEmployee.fullName}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                          <Briefcase size={14} className="text-primary" /> {selectedEmployee.position?.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 text-right">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Incidencias Periodo</p>
                      <p className="text-2xl font-black text-primary tracking-tight">
                        ${currentIncidents.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleProcessed(selectedEmployee.id)}
                      className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${processedEmployees.has(selectedEmployee.id) ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:scale-105'}`}
                    >
                      {processedEmployees.has(selectedEmployee.id) ? 'MARCAR COMO PENDIENTE' : 'FINALIZAR REVISIÓN'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {INCIDENT_GROUPS.map((group, gIdx) => (
                    <div key={gIdx} className="border-2 border-slate-50 rounded-[32px] overflow-hidden transition-all">
                      <button 
                        onClick={() => toggleSection(gIdx)}
                        className={`w-full flex items-center justify-between p-6 transition-all ${expandedSections[gIdx] ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <h4 className="text-xs font-black uppercase text-slate-600 tracking-[0.2em] flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${expandedSections[gIdx] ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {gIdx + 1}
                          </div>
                          <span>- {group.title}</span>
                        </h4>
                        <ChevronRight size={20} className={`text-slate-300 transition-transform duration-300 ${expandedSections[gIdx] ? 'rotate-90 text-primary' : ''}`} />
                      </button>
                      
                      {expandedSections[gIdx] && (
                        <div className="p-6 bg-white border-t-2 border-slate-50 animate-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            {group.incidents.map(incident => {
                              const existing = currentIncidents.find(i => i.type === incident.id);
                              return (
                                <IncidentRow 
                                  key={incident.id} 
                                  incident={incident} 
                                  data={existing}
                                  onSave={handleSaveIncident}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-6 rounded-[32px]">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <TrendingUp className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h5 className="font-black text-emerald-800 uppercase tracking-widest text-[11px] mb-1">Cierre Automático</h5>
                  <p className="text-emerald-600/80 text-xs font-bold">Todos los cambios se guardan en tiempo real y serán aplicados automáticamente al procesar la nómina.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function IncidentRow({ incident, data, onSave }: { incident: any, data: any, onSave: (type: string, data: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: data?.amount || "",
    quantity: data?.quantity || "",
    date: data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (data) setFormData({
      amount: data.amount,
      quantity: data.quantity || "",
      date: new Date(data.date).toISOString().split('T')[0]
    });
  }, [data]);

  const hasQuantity = incident.fields.includes("quantity");
  const hasDate = incident.fields.includes("date");

  return (
    <div className={`group p-4 rounded-2xl border-2 transition-all flex flex-col gap-4 ${data ? 'bg-primary/5 border-primary/10' : 'bg-slate-50/30 border-slate-100 hover:border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">{incident.label}</label>
          {!data && !isEditing && (
            <span className="text-[9px] text-slate-300 italic font-bold uppercase tracking-tighter bg-slate-100/50 px-2 py-0.5 rounded-md">
              PENDIENTE
            </span>
          )}
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${data ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
          >
            {data ? 'EDITAR' : 'INGRESAR'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-end gap-3 animate-in fade-in zoom-in-95 duration-200">
          {hasDate && (
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Fecha</label>
              <input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="bg-white border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          {hasQuantity && (
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cant. (Días/Hrs)</label>
              <input 
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="bg-white border rounded-lg px-2 py-1.5 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Monto ($)</label>
            <input 
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="bg-white border rounded-lg px-2 py-1.5 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-1 mb-0.5">
            <button 
              onClick={() => {
                onSave(incident.id, formData);
                setIsEditing(false);
              }}
              className="p-2 bg-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <Save size={14} />
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {data ? (
            <>
              {hasQuantity && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                    <Clock size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{data.quantity} <span className="text-[10px] text-slate-400">UND</span></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <DollarSign size={14} />
                </div>
                <span className="text-xs font-bold text-slate-600">${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {hasDate && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                    <Calendar size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{new Date(data.date).toLocaleDateString()}</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
