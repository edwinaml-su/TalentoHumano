"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { 
  Download, 
  Play, 
  CheckCircle, 
  History, 
  FileJson,
  Layers,
  ChevronDown,
  Info,
  Building2,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function PayrollPage() {
  const router = useRouter();
  const { 
    selectedUnitIds, 
    activeCurrency 
  } = useOrganization();
  
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [payrollType, setPayrollType] = useState("QUINCENAL");
  const [history, setHistory] = useState<any[]>([]);

  const payrollTypes = [
    { id: "QUINCENAL", label: "Nómina Quincenal", desc: "Pago cada 15 días" },
    { id: "CATORCENAL", label: "Nómina Catorcenal", desc: "Pago cada 14 días" },
    { id: "MENSUAL", label: "Nómina Mensual", desc: "Pago de mes completo" },
    { id: "SERVICIOS", label: "Servicios Profesionales", desc: "Retención del 10%" },
    { id: "AGUINALDO", label: "Aguinaldo / 13vo", desc: "Beneficio Anual" },
    { id: "FINIQUITO", label: "Liquidación / Art. 58", desc: "Indemnizaciones y Finiquitos" },
  ];

  useEffect(() => {
    if (selectedUnitIds.length > 0) {
      fetchHistory();
    }
  }, [selectedUnitIds]);

  const fetchHistory = async () => {
    try {
      const unitsParam = selectedUnitIds.join(',');
      const res = await fetch(`/api/payroll-runs?unitIds=${unitsParam}`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleProcessPayroll = async () => {
    if (selectedUnitIds.length === 0) {
      alert("⚠️ Error: No has seleccionado ninguna unidad operativa. Por favor, selecciona una en la barra lateral.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/payroll-runs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitIds: selectedUnitIds,
          type: payrollType,
          month: 3, 
          year: 2026
        })
      });
      
      const result = await res.json();

      if (res.ok) {
        setCompleted(true);
        fetchHistory();
      } else {
        alert(`❌ Error al procesar la nómina: ${result.error || 'Ocurrió un problema inesperado'}`);
      }
    } catch (err) {
      console.error("Error processing payroll:", err);
      alert("❌ Error de conexión: No se pudo contactar con el servidor de nómina.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Nómina</h1>
          <p className="text-muted-foreground">Procesamiento masivo y generación de archivos bancarios.</p>
        </div>
        {!completed && (
          <div className="flex flex-col items-end gap-2">
            <button 
              className={`btn btn-primary ${processing || selectedUnitIds.length === 0 ? "opacity-50" : "hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"}`}
              onClick={() => {
                if (selectedUnitIds.length === 0) {
                  alert("Por favor, selecciona al menos una unidad operativa en la barra lateral antes de ejecutar la nómina.");
                  return;
                }
                handleProcessPayroll();
              }}
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <>
                  <Play size={18} className="mr-2" />
                  <span>Ejecutar {payrollTypes.find(t => t.id === payrollType)?.label}</span>
                </>
              )}
            </button>
            {selectedUnitIds.length === 0 && (
              <span className="text-[10px] text-rose-500 font-bold animate-pulse">
                ⚠️ Requiere selección de unidad
              </span>
            )}
          </div>
        )}
        {completed && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100 font-bold animate-fade-in shadow-sm">
            <CheckCircle size={18} />
            <span>Nómina Procesada con Éxito</span>
            <button className="btn btn-secondary btn-sm ml-4 bg-white" onClick={() => setCompleted(false)}>Nueva Ejecución</button>
          </div>
        )}
      </div>

      {selectedUnitIds.length === 0 ? (
        <div className="mt-12 p-12 card bg-slate-50 border-dashed flex flex-col items-center text-center animate-fade-in">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-primary">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Selección Requerida</h2>
          <p className="text-slate-500 max-w-md mt-2">
            Para gestionar la nómina, primero debes seleccionar una o más unidades operativas desde el menú en la barra lateral izquierda.
          </p>
          <div className="mt-6 flex gap-2 items-center text-primary font-bold animate-bounce">
            <ArrowLeft size={18} />
            <span className="text-sm">Selecciona una unidad aquí</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* ... dropdown and summary cards ... */}
            {/* I'll keep the previous implementation but wrapped in this condition */}
            <div className="card p-6">
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Tipo de Nómina a Procesar
              </label>
              <div className="relative">
                <select 
                  className="w-full p-4 bg-secondary border border-border rounded-xl font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={payrollType}
                  onChange={(e) => setPayrollType(e.target.value)}
                  disabled={processing}
                >
                  {payrollTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label} — {type.desc}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <ChevronDown size={20} />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0" size={18} />
                <div className="text-xs text-blue-700 leading-relaxed">
                  <strong>Nota:</strong> Al seleccionar este tipo de nómina, el sistema aplicará las reglas de cálculo, deducciones y periodos correspondientes según la configuración local de la unidad operativa.
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold">Resumen Proyectado</h3>
                <span className="bg-secondary px-3 py-1 rounded-full text-xs font-bold">Marzo 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Neto</div>
                  <div className="text-xl font-bold text-primary">{activeCurrency.symbol}{activeCurrency.code === 'USD' ? '185,420.50' : '1,450,200.00'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Retenciones</div>
                  <div className="text-xl font-bold text-primary">{activeCurrency.symbol}{activeCurrency.code === 'USD' ? '24,150.25' : '185,400.00'}</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-secondary rounded-xl">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">Exportar para Bancos</h4>
                <div className="flex gap-3">
                  <div className="flex-1 flex justify-between items-center bg-background p-3 rounded-lg border">
                    <span className="text-xs font-bold">Agrícola (TXT)</span>
                    <Download size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex justify-between items-center bg-background p-3 rounded-lg border">
                    <span className="text-xs font-bold">BAC (CSV)</span>
                    <Download size={14} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 card p-6">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-primary" />
              <h3 className="text-lg font-bold">Historial de Planillas</h3>
            </div>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <History size={24} className="opacity-20" />
                  </div>
                  <p className="text-sm">No hay planillas procesadas en las unidades seleccionadas.</p>
                </div>
              ) : history.map((run) => (
                <div key={run.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-muted/50 rounded-xl transition-colors group">
                  <div>
                    <div className="font-bold text-slate-800">Planilla {new Date(run.startDate).toLocaleDateString()} - {new Date(run.endDate).toLocaleDateString()}</div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">{run.location?.name || 'Global'}</span>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${run.status === 'PROCESSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {run.status}
                      </span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase">{run.payrollType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-700">{run._count.employees} Empleados</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-primary btn-sm flex items-center gap-2 shadow-sm"
                        onClick={() => router.push(`/payroll/${run.id}`)}
                      >
                        <Layers size={14} />
                        <span>Ver Grid</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .card { background: var(--background); border: 1px solid var(--border); border-radius: var(--radius); }
        .btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.6rem 1.2rem; }
        .btn-primary { background: var(--primary); color: white; border: none; }
        .btn-secondary { background: var(--secondary); color: var(--foreground); border: 1px solid var(--border); }
        .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
        .text-primary { color: var(--primary); }
        .text-muted-foreground { color: var(--muted-foreground); }
      `}</style>
    </Shell>
  );
}
