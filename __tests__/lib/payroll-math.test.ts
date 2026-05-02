import { calculateElSalvadorStatutory, calculateVacationBonusSV } from '@/lib/payroll-math';

// ─── calculateElSalvadorStatutory ────────────────────────────────────────────
describe('calculateElSalvadorStatutory', () => {
  it('calcula ISSS al 3% para salarios bajo el límite de $1,000', () => {
    const { isss } = calculateElSalvadorStatutory(500);
    expect(isss).toBeCloseTo(15, 2);
  });

  it('ISSS se topa en $30 cuando el salario es $1,000 o más', () => {
    const { isss: at1000 } = calculateElSalvadorStatutory(1000);
    const { isss: at2000 } = calculateElSalvadorStatutory(2000);
    expect(at1000).toBeCloseTo(30, 2);
    expect(at2000).toBeCloseTo(30, 2); // capped
  });

  it('calcula AFP al 7.25% del salario base', () => {
    const { afp } = calculateElSalvadorStatutory(500);
    expect(afp).toBeCloseTo(36.25, 2);
  });

  it('AFP tiene techo máximo basado en $7,045.06', () => {
    const { afp: highAfp } = calculateElSalvadorStatutory(100_000);
    const maxAfp = 7045.06 * 0.0725;
    expect(highAfp).toBeCloseTo(maxAfp, 2);
  });

  it('salario cero retorna ISSS y AFP en cero', () => {
    const { isss, afp } = calculateElSalvadorStatutory(0);
    expect(isss).toBe(0);
    expect(afp).toBe(0);
  });

  it('edge case: salario negativo retorna valores negativos sin crash', () => {
    // La función no hace guardia explícita; verificamos que no lance error
    expect(() => calculateElSalvadorStatutory(-100)).not.toThrow();
  });
});

// ─── calculateVacationBonusSV ─────────────────────────────────────────────────
describe('calculateVacationBonusSV', () => {
  it('bono vacacional = 15% del salario mensual (30% de 15 días)', () => {
    // $1,200 / 2 = $600 → 30% = $180? NO: 30% of half-month = $600*0.30 = $180
    expect(calculateVacationBonusSV(1200)).toBeCloseTo(180, 2);
  });

  it('resultado correcto para salario mínimo ~$365', () => {
    expect(calculateVacationBonusSV(365)).toBeCloseTo(54.75, 2);
  });

  it('salario cero retorna cero', () => {
    expect(calculateVacationBonusSV(0)).toBe(0);
  });
});
