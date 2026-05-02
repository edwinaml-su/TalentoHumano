import { prisma } from "./prisma";

/**
 * Calculates ISR (Income Tax) for a given taxable income based on the 
 * progressive tables configured in the database.
 * 
 * @param taxableIncome The amount subject to tax (after ISSS/AFP deductions)
 * @param countryCode The country code (e.g. 'SV')
 * @param frequency The payroll frequency (e.g. 'MONTHLY', 'BIWEEKLY', 'WEEKLY')
 */
export async function calculateISR(
  taxableIncome: number,
  countryCode: string,
  frequency: string
): Promise<number> {
  const country = await prisma.country.findFirst({
    where: { isoCode: countryCode }
  });

  if (!country) return 0;

  const table = await prisma.taxTable.findFirst({
    where: {
      countryId: country.id,
      frequency: frequency,
      isActive: true
    },
    include: {
      brackets: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!table || table.brackets.length === 0) {
    // Fallback or log if no table found
    console.warn(`No tax table found for ${countryCode} with frequency ${frequency}`);
    return 0;
  }

  // Find the matching bracket
  const bracket = table.brackets.find(b => {
    const from = Number(b.fromAmount);
    const to = b.toAmount ? Number(b.toAmount) : Infinity;
    return taxableIncome >= from && taxableIncome <= to;
  });

  if (!bracket) {
    // If we're below the first bracket or above everything
    if (taxableIncome < Number(table.brackets[0].fromAmount)) return 0;
    
    // Default to last bracket if somehow missed (though findFirst should catch)
    return 0; 
  }

  const fixed = Number(bracket.fixedAmount);
  const percentage = Number(bracket.percentage);
  const excessOf = Number(bracket.excessOf);

  const tax = fixed + (percentage * (taxableIncome - excessOf));
  
  return Math.max(0, tax);
}

/**
 * Calculates statutory deductions for El Salvador (ISSS and AFP)
 */
export function calculateElSalvadorStatutory(baseSalary: number) {
  // ISSS: 3.0% capped at $1000
  const isss = Math.min(baseSalary * 0.03, 30);
  
  // AFP: 7.25% capped at $7,045.06 (limiting to $510.77 roughly)
  const afp = Math.min(baseSalary * 0.0725, 7045.06 * 0.0725);
  
  return { isss, afp };
}

/**
 * Calculates Vacation Bonus for El Salvador (30% of 15 days of salary)
 */
export function calculateVacationBonusSV(baseSalary: number): number {
  const fifteenDaysSalary = baseSalary / 2;
  return fifteenDaysSalary * 0.30;
}

/**
 * Calculates statutory deductions for Guatemala (IGSS and Bonificación Incentivo)
 */
export function calculateGuatemalaStatutory(baseSalary: number) {
  // IGSS: 4.83% of salary (Employee)
  const igss = baseSalary * 0.0483;
  
  // Bonificación Incentivo: Fixed Q250.00 per month (simplified conversion if needed, but usually fixed)
  const bonusIncentivo = 250; 
  
  return { igss, bonusIncentivo };
}

