/**
 * Engine for generating mass payment files (Batch Files)
 * for different regional banks.
 */

export type BankProvider = 'AGRICOLA_SV' | 'BAC_REGIONAL' | 'CUSCATLAN_SV' | 'DAVIVIENDA_SV';

interface PaymentRecord {
  accountNumber: string;
  amount: number;
  employeeName: string;
  reference: string;
}

export function generateBankFile(
  provider: BankProvider,
  records: PaymentRecord[],
  companyAccount: string
): string {
  switch (provider) {
    case 'AGRICOLA_SV':
      return generateAgricolaFormat(records, companyAccount);
    case 'BAC_REGIONAL':
      return generateBACFormat(records, companyAccount);
    default:
      throw new Error(`Provider ${provider} not implemented yet.`);
  }
}

/**
 * Banco Agrícola (El Salvador) - Fixed Width Format Example
 * Header: 01 + CompanyAccount + Date + ...
 * Records: 02 + EmpAccount + Amount + ...
 */
function generateAgricolaFormat(records: PaymentRecord[], companyAccount: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let file = `01${companyAccount.padEnd(15, ' ')}${date}PLANILLA_NOMINA\n`;

  records.forEach((rec) => {
    const amountStr = (rec.amount * 100).toString().padStart(12, '0');
    file += `02${rec.accountNumber.padEnd(15, ' ')}${amountStr}${rec.employeeName.slice(0, 30).padEnd(30, ' ')}\n`;
  });

  return file;
}

/**
 * BAC Credomatic - CSV / Excel standard
 */
function generateBACFormat(records: PaymentRecord[], companyAccount: string): string {
  let file = "Cuenta Origen,Cuenta Destino,Monto,Nombre,Referencia\n";
  records.forEach((rec) => {
    file += `${companyAccount},${rec.accountNumber},${rec.amount.toFixed(2)},"${rec.employeeName}","${rec.reference}"\n`;
  });
  return file;
}
