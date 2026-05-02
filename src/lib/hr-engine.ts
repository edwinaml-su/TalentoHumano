import { prisma } from "./prisma";

/**
 * Calculates accrued vacation days for an employee based on El Salvador labor law.
 * Formula: 15 days per full year.
 */
export function calculateAccruedVacations(hireDate: Date, currentDate: Date = new Date()): number {
  const diffTime = Math.abs(currentDate.getTime() - hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = diffDays / 365;
  
  return Number((years * 15).toFixed(2));
}

/**
 * Calculates the settlement (Liquidación) for an employee.
 * Includes:
 * - Indemnificación (1 month per year, Art. 58)
 * - Proportional Vacation (15 days per year)
 * - Proportional Aguinaldo (Approx 15 days per year for < 3 years, etc. Simplified to 15 days base)
 */
export function calculateSettlement(
  baseSalary: number, 
  hireDate: Date, 
  terminationDate: Date = new Date()
) {
  const diffTime = Math.abs(terminationDate.getTime() - hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = diffDays / 365;

  // 1. Indemnización (Art. 58): 1 month per year
  const severance = baseSalary * years;

  // 2. Proportional Vacation: (Years * 15 days) * (Salary / 30)
  const vacationDays = years * 15;
  const vacationPay = vacationDays * (baseSalary / 30);

  // 3. Proportional Aguinaldo (Simplified: 15 days per year formula)
  const aguinaldoPay = (baseSalary / 2) * years;

  const total = severance + vacationPay + aguinaldoPay;

  return {
    yearsOfService: Number(years.toFixed(2)),
    severance: Number(severance.toFixed(2)),
    proportionalVacation: Number(vacationPay.toFixed(2)),
    proportionalAguinaldo: Number(aguinaldoPay.toFixed(2)),
    totalSettlement: Number(total.toFixed(2))
  };
}
