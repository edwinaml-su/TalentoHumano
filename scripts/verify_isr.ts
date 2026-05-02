import { calculateISR } from '../src/lib/payroll-math';

async function verify() {
  console.log("🧪 Verificando cálculo de ISR para El Salvador...");
  
  const taxableIncome = 1000;
  const countryCode = 'SV';
  const frequency = 'MONTHLY';
  
  const isr = await calculateISR(taxableIncome, countryCode, frequency);
  
  console.log(`- Taxable Income: $${taxableIncome}`);
  console.log(`- Frequency: ${frequency}`);
  console.log(`- Calculated ISR: $${isr.toFixed(2)}`);
  
  // Expected: $60 + 0.20 * (1000 - 761.91) = $107.62
  const expected = 107.62;
  const diff = Math.abs(isr - expected);
  
  if (diff < 0.01) {
    console.log("✅ CÁLCULO COINCIDE CON TABLA DECRETO 75!");
  } else {
    console.error(`❌ ERROR: Se esperaba $${expected}, se obtuvo $${isr.toFixed(2)}`);
    process.exit(1);
  }
}

verify().catch(console.error);
