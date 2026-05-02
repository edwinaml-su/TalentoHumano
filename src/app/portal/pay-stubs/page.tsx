"use client";

import { useEffect, useState } from "react";
import { generatePayStubPDF } from "@/lib/pdf-generator";
import { Loader2, FileText, Download } from "lucide-react";

export default function EmployeePayStubsPage() {
  const [stubs, setStubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStubs() {
      // Simulator: get first employee and their stubs via a new API or existing one
      const res = await fetch("/api/portal/pay-stubs"); // I'll create this API
      const data = await res.json();
      setStubs(data);
      setLoading(false);
    }
    fetchStubs();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Recibos de Pago</h1>
        <p className="text-gray-500">Historial quincenal y mensual de pagos recibidos</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {stubs.length === 0 ? (
            <div className="p-20 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-gray-400">Aún no tienes recibos generados.</p>
            </div>
          ) : (
            stubs.map((stub) => (
              <div key={stub.id} className="p-6 hover:bg-gray-50 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    $
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {stub.payrollRun.startDate.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Período {stub.payrollRun.payrollType.toLowerCase()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Pago Neto</p>
                    <p className="text-lg font-bold text-green-600">${stub.netPay.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => generatePayStubPDF(stub)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-xs"
                  >
                    <Download size={14} />
                    Descargar PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
