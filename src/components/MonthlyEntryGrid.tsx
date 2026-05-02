"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Save, 
  Upload, 
  X, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import * as XLSX from "xlsx";

interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  dui: string | null;
  position: { title: string; department: { name: string } };
  location: { name: string };
}

interface MonthlyEntryGridProps {
  unitIds: string[];
  onClose: () => void;
}

export function MonthlyEntryGrid({ unitIds, onClose }: MonthlyEntryGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const dayHeaders = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const headers = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayName = date.toLocaleString('es-ES', { weekday: 'narrow' }).toUpperCase();
      const label = dayName === 'M' && date.getDay() === 3 ? 'MR' : dayName;
      headers.push({ day: i, label });
    }
    return headers;
  }, [currentDate, daysInMonth]);

  useEffect(() => {
    fetchAvailableEmployees();
  }, [unitIds]);

  const fetchAvailableEmployees = async () => {
    setLoading(true);
    try {
      // Re-use the existing endpoint but handle specific unit IDs
      const res = await fetch(`/api/attendance/monthly?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}&unitIds=${unitIds.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableEmployees(data.employees);
        
        // Initial load of existing records
        const gridState: Record<string, Record<number, string>> = {};
        const empsWithRecords = new Set<string>();
        
        data.attendances.forEach((att: any) => {
          if (!gridState[att.employeeId]) gridState[att.employeeId] = {};
          const day = new Date(att.date).getUTCDate();
          gridState[att.employeeId][day] = att.totalHours ? att.totalHours.toString() : att.status;
          empsWithRecords.add(att.employeeId);
        });
        
        setRecords(gridState);
        
        // Auto-add employees who already have records
        const initialSelected = data.employees.filter((e: any) => empsWithRecords.has(e.id));
        setSelectedEmployees(initialSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = (emp: Employee) => {
    if (!selectedEmployees.find(e => e.id === emp.id)) {
      setSelectedEmployees(prev => [...prev, emp]);
    }
    setShowSearch(false);
    setSearchTerm("");
  };

  const removeEmployee = (id: string) => {
    setSelectedEmployees(prev => prev.filter(e => e.id !== id));
  };

  const filteredSearch = availableEmployees.filter(emp => 
    !selectedEmployees.find(se => se.id === emp.id) &&
    (
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.employeeCode.includes(searchTerm) ||
      (emp.dui && emp.dui.includes(searchTerm))
    )
  );

  const handleKeyDown = (e: React.KeyboardEvent, empIdx: number, dayIdx: number) => {
    let targetId = "";
    if (e.key === "ArrowRight") targetId = `cell-${empIdx}-${dayIdx + 1}`;
    if (e.key === "ArrowLeft") targetId = `cell-${empIdx}-${dayIdx - 1}`;
    if (e.key === "ArrowDown") targetId = `cell-${empIdx + 1}-${dayIdx}`;
    if (e.key === "ArrowUp") targetId = `cell-${empIdx - 1}-${dayIdx}`;

    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        (target as HTMLInputElement).focus();
        (target as HTMLInputElement).select();
      }
    }
  };

  const handleCellChange = (empId: string, day: number, value: string) => {
    setRecords(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [day]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const toSave: any[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    selectedEmployees.forEach(emp => {
      const days = records[emp.id] || {};
      Object.entries(days).forEach(([day, val]) => {
        if (!val || val === "-") return;
        
        const date = new Date(Date.UTC(year, month, parseInt(day)));
        const isNumeric = !isNaN(parseFloat(val));
        
        toSave.push({
          employeeId: emp.id,
          date: date.toISOString(),
          status: isNumeric ? 'PRESENT' : val,
          totalHours: isNumeric ? parseFloat(val) : null
        });
      });
    });

    try {
      const res = await fetch('/api/attendance/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: toSave })
      });
      if (res.ok) {
        alert("Cambios guardados exitosamente");
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const newRecords = { ...records };
      const newSelected = [...selectedEmployees];
      
      data.slice(1).forEach(row => {
        const dui = row[0]?.toString().trim();
        const emp = availableEmployees.find(e => e.dui === dui);
        if (emp) {
          if (!newSelected.find(se => se.id === emp.id)) newSelected.push(emp);
          if (!newRecords[emp.id]) newRecords[emp.id] = {};
          for (let i = 1; i <= daysInMonth; i++) {
            const val = row[5 + i]; 
            if (val !== undefined) {
              newRecords[emp.id][i] = val.toString();
            }
          }
        }
      });
      setSelectedEmployees(newSelected);
      setRecords(newRecords);
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const header = [
      "DUI", 
      "Nombre Completo", 
      "Cargo", 
      "Ubicación", 
      "Unidad", 
      "Total",
      ...dayHeaders.map(h => `${h.label} ${h.day}`)
    ];
    
    // Sort employees by department/department if possible, or just as is
    const rows = availableEmployees.map(emp => [
      emp.dui || "",
      emp.fullName,
      emp.position.title,
      emp.location.name,
      emp.position.department.name,
      "", // Placeholder for Total
      ...Array(daysInMonth).fill("")
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 15 }, // DUI
      { wch: 30 }, // Nombre
      { wch: 25 }, // Cargo
      { wch: 20 }, // Ubicacion
      { wch: 20 }, // Dept
      { wch: 8 },  // Total
      ...Array(daysInMonth).fill({ wch: 4 })
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, `Plantilla_Asistencia_${monthName.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col animate-slide-up overflow-hidden my-6 h-[700px] relative z-20">
      {/* Header */}
      <div className="flex flex-col border-b bg-white shadow-sm">
        <div className="flex justify-between items-center p-4 px-6 ">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={onClose}><X size={24} /></button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Carga de Horas por Departamento</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{monthName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-2 px-6 font-bold text-slate-700 text-sm whitespace-nowrap min-w-[150px] justify-center capitalize">
                <Calendar size={16} className="text-primary" /> {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </div>
              <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={18} /></button>
            </div>

            <button className="btn btn-slate border-dashed" onClick={() => setShowSearch(true)}>
              <Plus size={18} />
              <span>Agregar</span>
            </button>

            <button className="btn btn-slate" onClick={handleDownloadTemplate}>
              <Download size={18} />
              <span>Plantilla</span>
            </button>

            <label className="btn btn-slate cursor-pointer relative">
              <Upload size={18} />
              <span>Cargar Excel</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
            </label>

            <button className="btn btn-primary px-8 shadow-lg shadow-blue-500/20" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Guardando...' : 'Aplicar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container with Scroll */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Search Modal/Overlay */}
        {showSearch && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-[500px] border animate-slide-up">
              <div className="p-4 border-b flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Buscar por nombre o DUI..." 
                  className="flex-1 outline-none text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => setShowSearch(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="max-height-[400px] overflow-auto p-2 flex flex-col gap-1">
                {filteredSearch.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">No se encontraron empleados</div>
                ) : filteredSearch.map(emp => (
                  <button 
                    key={emp.id} 
                    className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
                    onClick={() => addEmployee(emp)}
                  >
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{emp.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.dui} | {emp.position.title}</div>
                    </div>
                    <Plus size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The Grid */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50 custom-scrollbar">
          <div className="bg-white rounded-2xl border shadow-sm inline-block min-w-full">
            <table className="timesheet-table">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <th rowSpan={2} className="w-[120px] p-4 text-left border-r sticky left-0 bg-slate-50 z-30">DUI</th>
                  <th rowSpan={2} className="w-[200px] p-4 text-left border-r sticky left-[120px] bg-slate-50 z-30">Empleado</th>
                  <th rowSpan={2} className="w-[150px] p-4 text-left border-r">Cargo</th>
                  <th rowSpan={2} className="w-[120px] p-4 text-left border-r">Ubicación</th>
                  <th colSpan={daysInMonth} className="p-3 text-center border-b bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">Ingreso de Horas Reales Laboradas</th>
                  <th rowSpan={2} className="w-16 p-4 text-center border-l bg-slate-50 sticky right-0 z-30">H. R.</th>
                  <th rowSpan={2} className="w-12 p-4 text-center z-30 bg-slate-50 sticky right-[64px]"></th>
                </tr>
                <tr className="bg-white">
                  {dayHeaders.map(h => {
                    const isWeekend = h.label === 'D' || h.label === 'S';
                    return (
                      <th key={h.day} className={`w-10 min-w-[40px] p-1 text-center border-r border-b second-row-header ${isWeekend ? 'bg-orange-50/30' : ''}`}>
                        <div className="text-[8px] opacity-40 font-black">{h.label}</div>
                        <div className="text-[11px] font-black text-slate-700">{h.day}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedEmployees.map((emp, empIdx) => {
                  const rowRecords = records[emp.id] || {};
                  const totalWorked = Object.values(rowRecords).reduce((acc, v) => {
                    const n = parseFloat(v);
                    return acc + (isNaN(n) ? 0 : n);
                  }, 0);
                  const remaining = totalWorked - 176;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-3 text-[10px] font-mono sticky left-0 bg-white z-10 border-r text-slate-500">{emp.dui}</td>
                      <td className="p-3 text-xs font-bold sticky left-[120px] bg-white z-10 border-r text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{emp.fullName}</td>
                      <td className="p-3 text-[10px] text-slate-500 border-r">{emp.position.title}</td>
                      <td className="p-3 border-r">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase whitespace-nowrap">{emp.location.name}</span>
                      </td>
                      
                      {dayHeaders.map((h, dayIdx) => {
                        const val = rowRecords[h.day] || "";
                        const isWeekend = h.label === 'D' || h.label === 'S';
                        const isSpecial = ['INC', 'VAC', 'AUS', 'LIC'].includes(val);

                        return (
                          <td key={h.day} className={`p-0 border-r ${isWeekend ? 'bg-slate-50/30' : ''}`}>
                            <input 
                              id={`cell-${empIdx}-${dayIdx}`}
                              type="text"
                              value={val}
                              onChange={(e) => handleCellChange(emp.id, h.day, e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleKeyDown(e, empIdx, dayIdx)}
                              className={`w-10 h-10 text-center text-[11px] border-none bg-transparent focus:ring-2 focus:ring-primary focus:z-10 transition-all outline-none font-bold
                                ${isSpecial ? 'bg-red-50 text-red-600' : val ? 'text-primary' : 'text-slate-300'}
                              `}
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      
                      <td className={`p-3 text-xs font-black text-center sticky right-0 bg-white z-10 border-l ${totalWorked < 176 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {totalWorked}
                      </td>
                      <td className="p-3 text-center sticky right-[64px] bg-white z-10 border-l opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => removeEmployee(emp.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
                {selectedEmployees.length === 0 && (
                  <tr>
                    <td colSpan={dayHeaders.length + 6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <AlertCircle size={40} className="mb-2" />
                        <p className="text-sm font-bold text-slate-400">No hay empleados seleccionados</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Usa el botón superior para agregar personal al grid</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Códigos de Asistencia:</div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></div>
              <span className="text-[10px] font-bold text-red-600">INC (Incapacidad)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></div>
              <span className="text-[10px] font-bold text-red-600">VAC (Vacación)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></div>
              <span className="text-[10px] font-bold text-red-600">AUS (Ausencia)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></div>
              <span className="text-[10px] font-bold text-red-600">LIC (Licencia)</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">* Ingrese números para registrar horas laboradas.</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border-radius: 12px; font-weight: 800; font-size: 0.8rem; transition: all 0.2s; }
        .btn-primary { background: #2563eb; color: white; border: none; }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-slate { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .btn-slate:hover { background: #e2e8f0; }
        
        .timesheet-table { border-collapse: separate; border-spacing: 0; table-layout: fixed; }
        .timesheet-table th, .timesheet-table td { transition: background 0.2s; }
        
        /* Fixed Column Shadow logic */
        .sticky.left-0, .sticky.left-[120px] {
          box-shadow: 2px 0 8px rgba(0,0,0,0.03);
        }
        .sticky.right-0 {
          box-shadow: -2px 0 8px rgba(0,0,0,0.03);
        }
        
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
