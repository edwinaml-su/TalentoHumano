"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ArrowRight,
  Calculator,
  Calendar,
  DollarSign,
  AlertCircle,
  CreditCard
} from "lucide-react";

interface Obligation {
  id?: string;
  type: string;
  totalAmount: number;
  quota: number;
  balance: number;
  startDate: string;
  status: boolean;
  description?: string;
}

interface Props {
  employeeId: string;
}

const OBLIGATION_TYPES = [
  { id: "HOSPITAL", label: "Descuentos Hospitalarios" },
  { id: "BANK_LOAN", label: "Préstamos Bancarios" },
  { id: "JUDICIAL_SEIZURE", label: "Embargos Judiciales" },
  { id: "PROCURADURIA", label: "Procuraduría" },
  { id: "FOSOFAMILIA", label: "Fondo Social Salud" },
];

export default function PayrollBenefitsSection({ employeeId }: Props) {
  const [activeTab, setActiveTab] = useState("HOSPITAL");
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<Obligation | null>(null);

  useEffect(() => {
    fetchObligations();
  }, [employeeId]);

  const fetchObligations = async () => {
    try {
      const res = await fetch(`/api/employees-data/${employeeId}/obligations`);
      if (res.ok) {
        const data = await res.json();
        setObligations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeObligations = obligations.filter(o => o.type === activeTab);

  const startNewEntry = () => {
    setNewEntry({
      type: activeTab,
      totalAmount: 0,
      quota: 0,
      balance: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: true
    });
  };

  const handleSave = async (item: Obligation) => {
    const method = item.id ? "PUT" : "POST";
    const url = item.id 
      ? `/api/employees-data/${employeeId}/obligations/${item.id}` 
      : `/api/employees-data/${employeeId}/obligations`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, type: activeTab })
      });

      if (res.ok) {
        fetchObligations();
        setNewEntry(null);
        setIsEditing(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este registro?")) return;
    try {
      const res = await fetch(`/api/employees-data/${employeeId}/obligations/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchObligations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="payroll-benefits-container">
      <div className="sub-tabs flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        {OBLIGATION_TYPES.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setNewEntry(null);
              setIsEditing(null);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all
              ${activeTab === tab.id 
                ? "bg-white text-primary shadow-sm border border-slate-100" 
                : "text-slate-400 hover:text-slate-600"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            {OBLIGATION_TYPES.find(t => t.id === activeTab)?.label}
          </h4>
          <p className="text-xs text-slate-500">Gestión de saldos y cuotas de descuentos recurrentes.</p>
        </div>
        {!newEntry && (
          <button 
            onClick={startNewEntry}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all"
          >
            <Plus size={18} />
            Añadir Registro
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
              <th className="p-4 border-r">Estado</th>
              <th className="p-4 border-r">Monto Deuda</th>
              <th className="p-4 border-r">Cuota Mensual</th>
              <th className="p-4 border-r">Saldo Actual</th>
              <th className="p-4 border-r">Fecha Inicio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* New Entry Row */}
            {newEntry && (
              <EditableRow 
                item={newEntry} 
                onSave={handleSave} 
                onCancel={() => setNewEntry(null)} 
              />
            )}

            {/* Existing Rows */}
            {activeObligations.map(ob => (
              isEditing === ob.id ? (
                <EditableRow 
                  key={ob.id} 
                  item={ob} 
                  onSave={handleSave} 
                  onCancel={() => setIsEditing(null)} 
                />
              ) : (
                <tr key={ob.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 border-r text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${ob.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {ob.status ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="p-4 border-r font-mono text-sm font-bold text-slate-700">
                    ${Number(ob.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 border-r font-mono text-sm text-rose-500 font-bold">
                    ${Number(ob.quota).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 border-r font-mono text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold ${ob.balance > 0 ? 'text-primary' : 'text-emerald-500'}`}>
                        ${Number(ob.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all" 
                          style={{ width: `${Math.max(0, Math.min(100, (1 - (ob.balance / ob.totalAmount)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-r text-xs font-semibold text-slate-500">
                    {new Date(ob.startDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setIsEditing(ob.id!)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(ob.id!)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}

            {activeObligations.length === 0 && !newEntry && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 italic text-sm">
                  No hay registros de {OBLIGATION_TYPES.find(t => t.id === activeTab)?.label.toLowerCase()} para este empleado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-4 items-start">
        <AlertCircle className="text-blue-500 shrink-0" size={20} />
        <div>
          <h5 className="text-[11px] font-black uppercase text-blue-700 tracking-widest mb-1">Nota sobre Automatización</h5>
          <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
            El sistema descontará automáticamente el monto de la "Cuota" de cada nómina procesada. 
            El "Saldo Actual" se actualizará al finalizar cada periodo. Cuando el saldo llegue a $0.00, el descuento se detendrá automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}

function EditableRow({ item, onSave, onCancel }: { item: Obligation, onSave: (i: Obligation) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Obligation>({ ...item });

  return (
    <tr className="bg-primary/5">
      <td className="p-2 border-r text-center">
        <select 
          value={formData.status ? "true" : "false"}
          onChange={e => setFormData({...formData, status: e.target.value === "true"})}
          className="bg-white border rounded p-1 text-[10px] font-bold outline-none"
        >
          <option value="true">ACTIVO</option>
          <option value="false">INACTIVO</option>
        </select>
      </td>
      <td className="p-2 border-r">
        <input 
          type="number" 
          value={formData.totalAmount}
          onChange={e => {
            const val = parseFloat(e.target.value) || 0;
            setFormData({...formData, totalAmount: val, balance: val}); // For new entries, balance starts at total
          }}
          className="w-full bg-white border rounded p-2 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
          placeholder="0.00"
        />
      </td>
      <td className="p-2 border-r">
        <input 
          type="number" 
          value={formData.quota}
          onChange={e => setFormData({...formData, quota: parseFloat(e.target.value) || 0})}
          className="w-full bg-white border rounded p-2 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
          placeholder="0.00"
        />
      </td>
      <td className="p-2 border-r">
        <input 
          type="number" 
          value={formData.balance}
          onChange={e => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
          className="w-full bg-white border rounded p-2 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
          placeholder="0.00"
        />
      </td>
      <td className="p-2 border-r">
        <input 
          type="date" 
          value={formData.startDate.split('T')[0]}
          onChange={e => setFormData({...formData, startDate: e.target.value})}
          className="w-full bg-white border rounded p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
        />
      </td>
      <td className="p-2 text-center">
        <div className="flex justify-center gap-1">
          <button onClick={() => onSave(formData)} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-all">
            <Save size={16} />
          </button>
          <button onClick={onCancel} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

