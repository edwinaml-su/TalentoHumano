import { jsPDF } from "jspdf";
import "jspdf-autotable";

export async function generatePayStubPDF(stub: any) {
  const doc = new jsPDF() as any;

  // Header
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PAGO", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("INVERSIONES AVANTE · CENTRAL DE VALORES", 105, 30, { align: "center" });

  // Employee Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL EMPLEADO", 14, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${stub.employee?.firstName} ${stub.employee?.lastName}`, 14, 65);
  doc.text(`Cargo: ${stub.employee?.position?.title || 'Empleado'}`, 14, 72);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 79);
  
  // Period Info
  doc.text(`Período: ${new Date(stub.payrollRun?.startDate).toLocaleDateString()} - ${new Date(stub.payrollRun?.endDate).toLocaleDateString()}`, 140, 65);
  doc.text(`Tipo: ${stub.payrollRun?.payrollType}`, 140, 72);

  // Table of Concepts
  const tableData = [
    ["Sueldo Base", `$${stub.grossPay.toLocaleString()}`, ""],
    ["Deducción ISSS (3%)", "", `-$${(stub.grossPay * 0.03).toFixed(2)}`],
    ["Deducción AFP (7.25%)", "", `-$${(stub.grossPay * 0.0725).toFixed(2)}`],
    ["Retención ISR", "", `-$${(stub.grossPay * 0.1).toFixed(2)}`], // Simplified
  ];

  doc.autoTable({
    startY: 95,
    head: [["Concepto", "Ingresos", "Deducciones"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillStyle: [79, 70, 229] },
  });

  // Footer / Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`TOTAL NETO A PAGAR: $${stub.netPay.toLocaleString()}`, 105, finalY + 10, { align: "center" });

  // Signature lines
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.line(40, finalY + 40, 90, finalY + 40);
  doc.text("Firma Empleado", 65, finalY + 45, { align: "center" });
  
  doc.line(120, finalY + 40, 170, finalY + 40);
  doc.text("Sello y Firma Patrono", 145, finalY + 45, { align: "center" });

  doc.save(`Recibo_${stub.employee?.lastName}_${stub.id.substring(0,5)}.pdf`);
}
