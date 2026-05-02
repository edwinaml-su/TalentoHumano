"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Shell } from "@/components/Shell";
import { 
  Scale, 
  ShieldCheck, 
  Calculator, 
  AlertCircle, 
  ChevronRight, 
  X, 
  Plus, 
  Save, 
  Trash2,
  Info
} from "lucide-react";

const INITIAL_RULES = [
  {
    country: "El Salvador",
    code: "SV",
    rules: [
      { name: "ISSS (Salud)", type: "DEDUCTION", value: "3.0%", cap: "$1000.00" },
      { name: "AFP (Pensiones)", type: "DEDUCTION", value: "7.25%", cap: "$7045.06" },
      { name: "ISR (Renta)", type: "TAX", value: "Tabla Progresiva", cap: "N/A" },
      { name: "Vacación (30%)", type: "BENEFIT", value: "30% s/15 días", cap: "Anual" },
    ]
  },
  {
    country: "Guatemala",
    code: "GT",
    rules: [
      { name: "IGSS", type: "DEDUCTION", value: "4.83%", cap: "N/A" },
      { name: "IRTRA", type: "CONTRIBUTION", value: "1.0%", cap: "Patronal" },
      { name: "Bono 14", type: "BENEFIT", value: "100%", cap: "Anual" },
    ]
  }
];

export default function LocalizationPage() {
  const [countries, setCountries] = useState(INITIAL_RULES);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isrTable, setIsrTable] = useState<any>(null);
  const [activeFrequency, setActiveFrequency] = useState("MONTHLY");
  const [isSavingIsr, setIsSavingIsr] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchIsrTable = async (countryCode: string, frequency: string) => {
    setIsrTable(null); // Reset while fetching
    console.log(`Fetching ISR table for ${countryCode} - ${frequency}`);
    try {
      const res = await fetch(`/api/localization/tax-tables?country=${countryCode}&frequency=${frequency}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Status:", res.status, errorText);
        throw new Error(`API Error: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched data:", data);
      setIsrTable(data || { id: 'new', brackets: [] });
    } catch (error) {
      console.error("Error fetching ISR table:", error);
      setIsrTable({ id: 'error', brackets: [] }); // Fallback to avoid crash
    }
  };

  const handleEditRules = (country: any) => {
    setEditingCountry(JSON.parse(JSON.stringify(country))); // Deep clone
    setShowModal(true);
    if (country.code === 'SV') {
      fetchIsrTable('SV', 'MONTHLY');
    }
  };

  const handleFrequencyChange = (freq: string) => {
    setActiveFrequency(freq);
    if (editingCountry) {
      fetchIsrTable(editingCountry.code, freq);
    }
  };

  const updateBracket = (idx: number, field: string, value: any) => {
    if (!isrTable?.brackets) return;
    const newBrackets = [...isrTable.brackets];
    newBrackets[idx] = { ...newBrackets[idx], [field]: value };
    setIsrTable({ ...isrTable, brackets: newBrackets });
  };

  const addBracket = () => {
    if (!isrTable) return;
    const brackets = isrTable.brackets || [];
    const lastBracket = brackets[brackets.length - 1];
    const newBracket = {
      fromAmount: lastBracket ? Number(lastBracket.toAmount) + 0.01 : 0,
      toAmount: null,
      fixedAmount: 0,
      percentage: 0,
      excessOf: 0,
    };
    setIsrTable({ ...isrTable, brackets: [...brackets, newBracket] });
  };

  const removeBracket = (idx: number) => {
    if (!isrTable?.brackets) return;
    const newBrackets = isrTable.brackets.filter((_: any, i: number) => i !== idx);
    setIsrTable({ ...isrTable, brackets: newBrackets });
  };

  const handleSaveIsr = async () => {
    if (!isrTable) return;
    setIsSavingIsr(true);
    try {
      const res = await fetch('/api/localization/tax-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: isrTable.id,
          brackets: isrTable.brackets
        })
      });
      if (res.ok) {
        alert("✅ Tabla de retenciones actualizada correctamente.");
      }
    } catch (error) {
      alert("❌ Error al guardar la tabla.");
    } finally {
      setIsSavingIsr(false);
    }
  };

  const handleSaveRules = () => {
    setCountries(prev => prev.map(c => c.code === editingCountry.code ? editingCountry : c));
    setShowModal(false);
    alert(`✅ Reglas para ${editingCountry.country} actualizadas exitosamente en el motor de nómina.`);
  };

  const addRule = () => {
    const newRule = { name: "Nueva Regla", type: "DEDUCTION", value: "0.0%", cap: "N/A" };
    setEditingCountry({
      ...editingCountry,
      rules: [...editingCountry.rules, newRule]
    });
  };

  const removeRule = (index: number) => {
    const newRules = editingCountry.rules.filter((_: any, i: number) => i !== index);
    setEditingCountry({ ...editingCountry, rules: newRules });
  };

  const updateRule = (index: number, field: string, value: string) => {
    const newRules = [...editingCountry.rules];
    newRules[index][field] = value;
    setEditingCountry({ ...editingCountry, rules: newRules });
  };

  return (
    <Shell>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="text-3xl font-black">Matriz de Reglas Legales</h1>
          <p className="subtitle">Configuración de deducciones, impuestos y beneficios por país (Localization Engine).</p>
        </div>
      </div>

      <div className="localization-grid animate-slide-up">
        {countries.map((country) => (
          <div key={country.code} className="card country-card group hover:border-primary transition-all">
            <div className="country-header">
              <div className="country-flag bg-slate-100 text-slate-600 font-black">{country.code}</div>
              <h3 className="text-xl font-bold">{country.country}</h3>
            </div>

            <div className="rules-list mt-2">
              {country.rules.map((rule, i) => (
                <div key={i} className="rule-item bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                  <div className="rule-main">
                    <span className="text-sm font-bold text-slate-800">{rule.name}</span>
                    <span className={`rule-type badge ${rule.type.toLowerCase()} text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 w-fit`}>
                      {rule.type}
                    </span>
                  </div>
                  <div className="rule-values text-right">
                    <span className="text-sm font-black text-primary">{rule.value}</span>
                    <span className="text-[10px] text-slate-400 block">Tope: {rule.cap}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-secondary w-full mt-4 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
              onClick={() => handleEditRules(country)}
            >
              <Calculator size={18} />
              <span>Configurar Reglas {country.code}</span>
            </button>
          </div>
        ))}

        <div className="card add-country-card border-dashed border-2 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
            <Plus size={32} />
          </div>
          <h3 className="font-bold text-slate-800">Añadir Nuevo País</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Importar matriz legal para un nuevo territorio.</p>
          <button className="btn btn-primary btn-sm mt-6">Empezar</button>
        </div>
      </div>

      <div className="compliance-section animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="card compliance-card border-l-4 border-primary shadow-xl p-8">
          <div className="card-header pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Estado de Cumplimiento Regional</h3>
                <p className="text-slate-500 font-medium">Alertas automáticas del Localization Monitoring Service</p>
              </div>
            </div>
          </div>
          <div className="alerts-list">
            <div className="alert-item warning bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm">Ajuste Legal: Honduras</div>
                  <div className="text-xs text-amber-700 mt-1 font-medium">Nuevo ajuste al salario mínimo proyectado para Abril 2026.</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm flex items-center gap-2 shadow-sm">
                <span>Actualizar Escalas</span>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; }
        .subtitle { color: var(--muted-foreground); }

        .localization-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .country-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .country-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .country-flag {
          width: 40px;
          height: 40px;
          background: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          border: 1px solid var(--border);
        }

        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rule-item {
          padding: 0.75rem;
          background: var(--secondary);
          border-radius: var(--radius);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rule-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .rule-name { font-weight: 600; font-size: 0.9rem; }
        .rule-type { font-size: 0.65rem; width: fit-content; }
        
        .badge.deduction { background: #fee2e2; color: #991b1b; }
        .badge.tax { background: #fef3c7; color: #92400e; }
        .badge.benefit { background: #dcfce7; color: #166534; }
        .badge.contribution { background: #dbeafe; color: #1e40af; }

        .rule-values {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .rule-val { font-weight: 700; color: var(--primary); }
        .rule-cap { font-size: 0.7rem; color: var(--muted-foreground); }

        .add-country-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
          border: 2px dashed var(--border);
          background: transparent;
        }

        .muted-icon { color: var(--muted-foreground); opacity: 0.5; }

        .compliance-card {
          border-left: 4px solid var(--primary);
        }

        .alerts-list { margin-top: 1.5rem; }

        .alert-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius);
        }

        .alert-item.warning {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
        }

        .alert-text {
          flex: 1;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-btn {
          background: transparent;
          color: var(--primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .w-full { width: 100%; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-4 { gap: 1rem; }
      `}</style>

      {isMounted && showModal && editingCountry && createPortal(
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            visibility: 'visible',
            opacity: 1,
            pointerEvents: 'auto'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal-content bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden" 
            style={{ 
              position: 'relative', 
              zIndex: 1000000,
              backgroundColor: 'white',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black">
                  {editingCountry.code}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Configurar {editingCountry.country}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payroll Multi-Country Engine</p>
                </div>
              </div>
              <button 
                className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 mb-6">
                <Info size={20} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Estás editando las reglas globales de cálculo para <strong>{editingCountry.country}</strong>. Estos cambios afectarán a todas las unidades operativas de este país en el próximo ciclo de nómina.
                </p>
              </div>

              <div className="space-y-4">
                {/* Headers */}
                <div className="flex gap-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-100 pb-2">
                  <div className="flex-[3]">Nombre de Regla</div>
                  <div className="flex-[2]">Tipo</div>
                  <div className="flex-[4]">Valor / Porcentaje</div>
                  <div className="flex-[2]">Tope Máximo</div>
                  <div className="w-10"></div>
                </div>

                {editingCountry.rules.map((rule: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 group/rule hover:bg-white hover:shadow-md transition-all">
                    {/* Nombre */}
                    <div className="flex-[3]">
                      <input 
                        type="text" 
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={rule.name}
                        onChange={(e) => updateRule(i, 'name', e.target.value)}
                      />
                    </div>

                    {/* Tipo */}
                    <div className="flex-[2]">
                      <select 
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                        value={rule.type}
                        onChange={(e) => updateRule(i, 'type', e.target.value)}
                      >
                        <option value="DEDUCTION">DEDUCTION</option>
                        <option value="TAX">TAX</option>
                        <option value="BENEFIT">BENEFIT</option>
                        <option value="CONTRIBUTION">CONTRIBUTION</option>
                      </select>
                    </div>

                    {/* Valor */}
                    <div className="flex-[4] flex gap-2 items-center">
                      <input 
                        type="text" 
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={rule.value}
                        onChange={(e) => updateRule(i, 'value', e.target.value)}
                      />
                      {rule.name.includes("Renta") && (
                        <button 
                          onClick={() => handleFrequencyChange('MONTHLY')}
                          className="px-2 py-2 bg-primary text-white text-[8px] font-black uppercase rounded-lg shadow-sm hover:scale-105 transition-all whitespace-nowrap shrink-0"
                        >
                          Config. ISR
                        </button>
                      )}
                    </div>

                    {/* Tope */}
                    <div className="flex-[2]">
                      <input 
                        type="text" 
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={rule.cap}
                        onChange={(e) => updateRule(i, 'cap', e.target.value)}
                      />
                    </div>

                    {/* Delete */}
                    <div className="w-10 flex justify-center">
                      <button 
                        onClick={() => removeRule(i)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  className="w-fit py-2 px-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  onClick={addRule}
                >
                  <Plus size={16} />
                  <span>Añadir Nueva Regla Legal</span>
                </button>
              </div>
            </div>

            {/* Divider Line */}
            {editingCountry.code === 'SV' && <div className="mx-8 border-t-2 border-slate-100" />}

            {/* ISR Table Preview Section */}
            {editingCountry.code === 'SV' && (
              <div className="p-8 bg-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                       <Calculator size={16} className="text-primary" />
                       Edición de Tablas Progresivas ISR
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold">Modificar tramos, cuotas fijas y porcentajes por frecuencia</p>
                  </div>
                  <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 gap-1">
                    {[
                      { l: 'Mensual', v: 'MONTHLY' },
                      { l: 'Quincenal', v: 'BIWEEKLY' },
                      { l: 'Semanal', v: 'WEEKLY' }
                    ].map(f => (
                      <button 
                        key={f.v}
                        onClick={() => handleFrequencyChange(f.v)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${activeFrequency === f.v ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-50 text-slate-400'}`}
                      >
                        {f.l}
                      </button>
                    ))}
                  </div>
                </div>

                {!isrTable || !isrTable.brackets ? (
                  <div className="p-8 text-center bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
                    <div className="relative inline-block mb-3">
                      <Calculator className="text-slate-300" size={32} />
                      <X className="absolute -bottom-1 -right-1 text-red-400" size={14} />
                    </div>
                    <p className="text-xs font-bold text-slate-500">No se encontró una tabla configurada para esta frecuencia.</p>
                    <button 
                      onClick={() => setIsrTable({ id: 'new', brackets: [] })}
                      className="mt-3 text-[10px] font-black uppercase text-primary hover:underline"
                    >
                      + Crear Nueva Tabla
                    </button>
                  </div>
                ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-[11px] min-w-[700px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="p-4 font-black text-slate-400 uppercase tracking-tighter w-28">Desde</th>
                              <th className="p-4 font-black text-slate-400 uppercase tracking-tighter w-28">Hasta</th>
                              <th className="p-4 font-black text-slate-400 uppercase tracking-tighter w-24">C. Fija</th>
                              <th className="p-4 font-black text-slate-400 uppercase tracking-tighter w-24">% Aplicar</th>
                              <th className="p-4 font-black text-slate-400 uppercase tracking-tighter w-28">S/Exceso</th>
                              <th className="p-4 w-12 text-center text-slate-300"><Trash2 size={14} className="mx-auto" /></th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-slate-700">
                            {isrTable.brackets.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-400 font-medium bg-slate-50/30">
                                  <Info size={24} className="mx-auto mb-3 opacity-20" />
                                  No hay tramos configurados para esta tabla.
                                  <br />
                                  <span className="text-[10px] opacity-70">Haz clic en "Añadir Tramo" para comenzar.</span>
                                </td>
                              </tr>
                            ) : isrTable.brackets.map((bracket: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-primary/20 text-[11px] font-bold"
                                    value={bracket.fromAmount || 0}
                                    onChange={(e) => updateBracket(idx, 'fromAmount', e.target.value)}
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="text" 
                                    placeholder="En adelante"
                                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-primary/20 text-[11px] font-bold"
                                    value={bracket.toAmount === null ? "" : bracket.toAmount}
                                    onChange={(e) => updateBracket(idx, 'toAmount', e.target.value === "" ? null : e.target.value)}
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-primary/20 text-[11px] font-bold"
                                    value={bracket.fixedAmount || 0}
                                    onChange={(e) => updateBracket(idx, 'fixedAmount', e.target.value)}
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-primary/20 text-[11px] font-bold"
                                    value={bracket.percentage || 0}
                                    onChange={(e) => updateBracket(idx, 'percentage', e.target.value)}
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-primary/20 text-[11px] font-bold"
                                    value={bracket.excessOf || 0}
                                    onChange={(e) => updateBracket(idx, 'excessOf', e.target.value)}
                                  />
                                </td>
                                <td className="p-2 flex justify-center">
                                  <button 
                                    onClick={() => removeBracket(idx)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={14} />
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
            )}

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {editingCountry.code === 'SV' && (
                  <>
                    <button 
                      onClick={addBracket}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={14} /> Añadir Tramo
                    </button>
                    <button 
                      onClick={handleSaveIsr}
                      disabled={isSavingIsr}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={14} /> {isSavingIsr ? "Guardando..." : "Actualizar Tabla ISR"}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                  className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-300 transition-all"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  onClick={handleSaveRules}
                >
                  <Save size={14} />
                  Guardar Cambios Legales
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Shell>
  );
}
