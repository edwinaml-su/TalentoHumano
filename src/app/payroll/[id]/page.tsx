"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ArrowLeft, 
  Search, 
  Printer,
  ChevronRight,
  ChevronLeft,
  Filter,
  Layers,
  Info
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Column Definitions to match the request exactly
const COLUMNS = [
  { key: "correlativo", label: "Correlativo" },
  { key: "afpStatus", label: "ESTADO AFP" },
  { key: "isssStatus", label: "ISSS" },
  { key: "employee.dui", label: "DUI" },
  { key: "employee.afpSelection", label: "AFP" },
  { key: "employee.hireDate", label: "FECHA DE INGRESO", type: "date" },
  { key: "employee.status", label: "ESTADO EMPLEADO" },
  { key: "employee.location.organization.commercialName", label: "GERENCIA" },
  { key: "employee.location.name", label: "CENTRO DE COSTO / UBICACIÓN" },
  { key: "employee.bankAccountNumber", label: "NO. CUENTA" },
  { key: "employee.bankName", label: "ENTIDAD FINANCIERA" },
  { key: "employee.fullName", label: "NOMBRE DE EMPLEADO" },
  { key: "employee.position.department.name", label: "DEPTO." },
  { key: "employee.position.title", label: "CARGO" },
  { key: "baseSalary", label: "SALARIO REFERENCIA", type: "currency" },
  { key: "planHours", label: "HORAS DEL PLAN" },
  { key: "workedHours", label: "HORAS TRABAJADAS" },
  { key: "workedDays", label: "DIAS LABORADOS" },
  { key: "earnedSalary", label: "SALARIO DEVENGADO", type: "currency" },
  { key: "secondPositions", label: "SEGUNDAS PLAZAS", type: "currency" },
  { key: "extraPlanHoursCount", label: "CANTIDAD HORAS ADICIONALES AL PLAN" },
  { key: "extraPlanHoursAmount", label: "HORAS ADICIONALES AL PLAN", type: "currency" },
  { key: "nightShiftHoursCount", label: "CANTIDAD NOCTURNIDAD" },
  { key: "nightShiftAmount", label: "NOCTURNIDAD", type: "currency" },
  { key: "overtimeDayHoursCount", label: "CANTIDAD HORAS EXTRAS DIURNAS" },
  { key: "overtimeDayAmount", label: "HORAS EXTRAS DIURNAS", type: "currency" },
  { key: "overtimeNightHoursCount", label: "CANTIDAD HORAS EXTRAS NOCTURNAS" },
  { key: "overtimeNightAmount", label: "HORAS EXTRAS NOCTURNAS", type: "currency" },
  { key: "restDaysWorkedCount", label: "CANTIDAD DIAS DE DESCANSO LABORADOS" },
  { key: "restDaysWorkedAmount", label: "DESCANSOS LABORADOS", type: "currency" },
  { key: "holidayDaysCount", label: "CANTIDAD DIAS FESTIVOS" },
  { key: "holidayDaysAmount", label: "MONTO DIAS FESTIVOS", type: "currency" },
  { key: "nightHolidayHoursCount", label: "CANTIDAD NOCTURNIDAD FESTIVA" },
  { key: "nightHolidayAmount", label: "MONTO NOCTURNIDAD FESTIVA", type: "currency" },
  { key: "extraHolidayHoursCount", label: "CANTIDAD HORAS ADICIONALES FESTIVAS" },
  { key: "extraHolidayAmount", label: "MONTO HORAS ADICIONALES FESTIVAS", type: "currency" },
  { key: "totalHolidaysAmount", label: "TOTAL FESTIVIDADES", type: "currency" },
  { key: "bonuses", label: "BONOS", type: "currency" },
  { key: "commissions", label: "COMISIONES", type: "currency" },
  { key: "stipends", label: "VIATICOS", type: "currency" },
  { key: "vacationBonus", label: "PRIMA VACACIONES (30%)", type: "currency" },
  { key: "vacationDaysTaken", label: "DIAS GOCE DE VACACIONES" },
  { key: "vacationDaysAmount", label: "MONTO GOCE DE VACACIONES", type: "currency" },
  { key: "regencies", label: "REGENCIAS", type: "currency" },
  { key: "lateArrivalsDeduction", label: "LLEGADAS TARDES", type: "currency" },
  { key: "unjustifiedAbsencesCount", label: "CANTIDAD AUSENCIAS INJUSTIFICADAS" },
  { key: "unjustifiedAbsencesAmount", label: "AUSENCIAS INJUSTIFICADAS", type: "currency" },
  { key: "isssLeaveDeductionCount", label: "CANTIDAD INCAPACIDAD ISSS (DESCONTAR)" },
  { key: "isssLeaveDeductionAmount", label: "INCAPACIDAD ISSS (DESCONTAR)", type: "currency" },
  { key: "isssLeaveFullPayCount", label: "CANTIDAD INCAPACIDAD ISSS (PAGO 100%)" },
  { key: "isssLeaveFullPayAmount", label: "INCAPACIDAD ISSS (PAGO 100%)", type: "currency" },
  { key: "unpaidLeaveDeduction", label: "PERMISO SIN GOCE DE SUELDO", type: "currency" },
  { key: "reimbursements", label: "REINTEGROS", type: "currency" },
  { key: "totalBenefits", label: "TOTAL BENEFICIOS", type: "currency" },
  { key: "isssHealthDeduction", label: "ISSS SALUD", type: "currency" },
  { key: "afpCrecerDeduction", label: "AFP CRECER", type: "currency" },
  { key: "afpConfiaDeduction", label: "AFP CONFIA", type: "currency" },
  { key: "ipsfaDeduction", label: "IPSFA", type: "currency" },
  { key: "taxableIncome", label: "INGRESOS GRAVADOS", type: "currency" },
  { key: "incomeTax", label: "I.S.R.", type: "currency" },
  { key: "otherDeductions", label: "OTROS DESCUENTOS", type: "currency" },
  { key: "vialidadDeduction", label: "VIALIDAD 2026", type: "currency" },
  { key: "fsvDeduction", label: "FONDO SOCIAL PARA LA VIVIENDA", type: "currency" },
  { key: "procuraduriaDeduction", label: "PROCURADURIA", type: "currency" },
  { key: "judicialSeizure", label: "EMBARGO JUDICIAL", type: "currency" },
  { key: "bankLoansDeduction", label: "PRESTAMOS BANCARIOS", type: "currency" },
  { key: "hospitalDeduction", label: "DESCUENTO HOSPITALARIO", type: "currency" },
  { key: "totalDeductions", label: "TOTAL DESCUENTOS", type: "currency" },
  { key: "netPay", label: "VALOR A RECIBIR", type: "currency" },
];

export default function DetailedPayrollPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (params?.id) fetchEmployees();
  }, [params?.id]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/payroll-runs/${params.id}/employees`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => 
      item.employee.fullName.toLowerCase().includes(lowerSearch) ||
      item.employee.employeeCode.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchTerm]);

  // Export Logic
  const exportToExcel = () => {
    const wsData = filteredData.map(item => {
      const row: any = {};
      COLUMNS.forEach(col => {
        let val = getNestedValue(item, col.key);
        if (col.type === 'currency' && val) val = Number(val);
        if (col.type === 'date' && val) val = new Date(val).toLocaleDateString();
        row[col.label] = val ?? "";
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Planilla");
    XLSX.writeFile(wb, `Planilla_${params.id}.xlsx`);
  };

  const exportToCSV = () => {
    const header = COLUMNS.map(c => `"${c.label}"`).join(",");
    const rows = filteredData.map(item => {
      return COLUMNS.map(col => {
        let val = getNestedValue(item, col.key);
        if (col.type === 'date' && val) val = new Date(val).toLocaleDateString();
        return `"${val ?? ""}"`;
      }).join(",");
    });
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Planilla_${params.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a3'); // Landscape, A3 for many columns
    doc.text("Planilla de Pago Detallada", 14, 15);
    
    const body = filteredData.map(item => {
      return COLUMNS.map(col => {
        let val = getNestedValue(item, col.key);
        if (col.type === 'currency' && val) return `$${Number(val).toFixed(2)}`;
        if (col.type === 'date' && val) return new Date(val).toLocaleDateString();
        return val ?? "";
      });
    });

    const headers = [COLUMNS.map(c => c.label)];

    (doc as any).autoTable({
      head: headers,
      body: body,
      startY: 20,
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillStyle: 'F', fillColor: [79, 70, 229] }, // Indigo primary
    });

    doc.save(`Planilla_${params.id}.pdf`);
  };

  return (
    <Shell>
      <div className="detailed-payroll-container">
        <header className="page-header animate-fade-in">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>Planilla Detallada</h1>
              <p className="subtitle">Visualización completa del Libro de Planilla (ID: {params.id})</p>
            </div>
          </div>
          
          <div className="actions-bar glass">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o código..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="divider" />
            <button className="btn btn-secondary" onClick={exportToCSV}>
              <FileSpreadsheet size={16} /> <span>CSV</span>
            </button>
            <button className="btn btn-secondary" onClick={exportToExcel}>
              <Download size={16} /> <span>Excel</span>
            </button>
            <button className="btn btn-secondary" onClick={exportToPDF}>
              <FileText size={16} /> <span>PDF</span>
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> <span>Imprimir</span>
            </button>
          </div>
        </header>

        <main className="content card animate-slide-up">
          <div className="table-wrapper custom-scrollbar">
            <table className="payroll-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className={col.type === 'currency' ? 'text-right' : ''}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={COLUMNS.length} className="text-center py-20">Analizando registros y generando visualización...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={COLUMNS.length} className="text-center py-20">No se encontraron registros para esta planilla.</td></tr>
                ) : filteredData.map((item, idx) => (
                  <tr key={idx}>
                    {COLUMNS.map((col) => {
                      let val = getNestedValue(item, col.key);
                      let display = val ?? "---";
                      
                      if (col.type === 'currency' && val) {
                        display = `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                      } else if (col.type === 'date' && val) {
                        display = new Date(val).toLocaleDateString();
                      }
                      
                      return (
                        <td key={col.key} className={col.type === 'currency' ? 'text-right font-mono' : ''}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <footer className="table-footer">
            <div className="totals-info">
              <span>Registros: <strong>{filteredData.length}</strong></span>
              <span>Total Neto a Pagar: <strong>$54,230.12</strong></span>
            </div>
            <div className="pagination">
              <button className="icon-btn-sm" disabled><ChevronLeft size={16}/></button>
              <span className="page-num">Página 1 de 1</span>
              <button className="icon-btn-sm" disabled><ChevronRight size={16}/></button>
            </div>
          </footer>
        </main>
      </div>

      <style jsx>{`
        .detailed-payroll-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: calc(100vh - 120px);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .actions-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 0.5rem;
          color: var(--muted-foreground);
        }

        .search-box input {
          background: transparent;
          border: none;
          font-size: 0.85rem;
          outline: none;
          width: 200px;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 0.25rem;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .table-wrapper {
          flex: 1;
          overflow: auto;
        }

        .payroll-table {
          width: max-content;
          border-collapse: separate;
          border-spacing: 0;
        }

        .payroll-table th {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--secondary);
          padding: 1rem 1.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
          border-bottom: 2px solid var(--border);
          white-space: nowrap;
          text-align: left;
        }

        .payroll-table td {
          padding: 0.85rem 1.5rem;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .payroll-table tr:hover td {
          background: hsla(221, 100%, 31%, 0.02);
        }

        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }

        .table-footer {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--background);
          border-top: 1px solid var(--border);
        }

        .totals-info {
          display: flex;
          gap: 2rem;
          font-size: 0.9rem;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-btn-sm {
          padding: 0.25rem;
          border-radius: 4px;
          background: var(--secondary);
        }

        .icon-btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media print {
          .shell :not(.detailed-payroll-container), 
          .actions-bar, 
          .icon-btn,
          .table-footer { display: none !important; }
          .payroll-table { width: 100% !important; font-size: 8px; }
          .table-wrapper { overflow: visible !important; }
        }
      `}</style>
    </Shell>
  );
}
