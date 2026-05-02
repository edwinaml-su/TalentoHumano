type RuleLogic = {
  percentage?: number;
  fixedAmount?: number;
  cap?: number;
  minAmount?: number;
};

type PayrollRule = {
  name: string;
  type: 'TAX' | 'BENEFIT' | 'CONTRIBUTION' | 'BONUS' | 'DEDUCTION';
  logic: RuleLogic;
};

export function calculateEntry(baseAmount: number, rule: PayrollRule) {
  let amount = 0;
  const { logic } = rule;

  if (logic.percentage) {
    amount = baseAmount * (logic.percentage / 100);
  } else if (logic.fixedAmount) {
    amount = logic.fixedAmount;
  }

  // Apply cap if exists
  if (logic.cap && baseAmount > logic.cap) {
    amount = logic.cap * (logic.percentage ? logic.percentage / 100 : 1);
  }

  // Apply minimum if exists
  if (logic.minAmount && amount < logic.minAmount) {
    amount = logic.minAmount;
  }

  return {
    name: rule.name,
    type: rule.type,
    amount: parseFloat(amount.toFixed(2))
  };
}

export function calculatePayroll(baseSalary: number, rules: PayrollRule[]) {
  const calculations = rules.map(rule => calculateEntry(baseSalary, rule));
  
  const totalDeductions = calculations
    .filter(c => c.type === 'TAX' || c.type === 'DEDUCTION' || c.type === 'CONTRIBUTION')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalBonuses = calculations
    .filter(c => c.type === 'BONUS' || c.type === 'BENEFIT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSalary = baseSalary + totalBonuses - totalDeductions;

  return {
    grossSalary: baseSalary,
    netSalary: parseFloat(netSalary.toFixed(2)),
    deductions: calculations.filter(c => c.type === 'TAX' || c.type === 'DEDUCTION' || c.type === 'CONTRIBUTION'),
    bonuses: calculations.filter(c => c.type === 'BONUS' || c.type === 'BENEFIT'),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    totalBonuses: parseFloat(totalBonuses.toFixed(2))
  };
}
