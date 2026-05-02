import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUnitAccess } from "@/lib/security";
import { calculateISR, calculateElSalvadorStatutory, calculateVacationBonusSV } from "@/lib/payroll-math";
import { z } from "zod";

const ProcessPayrollSchema = z.object({
  unitIds: z.array(z.string()).min(1, "Debe seleccionar al menos una unidad"),
  type: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ProcessPayrollSchema.parse(body);
    const { unitIds, type, month, year } = data;

    // TODO: Unified user identification for simulation (matching admin@global.com from seed)
    // Needs to be replaced with real Auth session ID when Auth is fully integrated
    const user = await prisma.user.findFirst({ where: { email: 'admin@global.com' } });
    if (!user) {
      return NextResponse.json({ error: "User context not found" }, { status: 401 });
    }
    const userId = user.id;

    // AC 4: Validation of Security (Hardening)
    const hasAccess = await validateUnitAccess(userId, unitIds);
    if (!hasAccess) {
      return NextResponse.json({ 
        error: "Forbidden: No tienes permisos para gestionar una o más de las unidades seleccionadas." 
      }, { status: 403 });
    }

    // 1. Create the Payroll Run
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payrollRun = await prisma.payrollRun.create({
      data: {
        startDate,
        endDate,
        status: "PROCESSED",
        payrollType: type,
        locationId: unitIds[0] // Associating with primary unit for now
      }
    });

    // 2. Get Employees for these units
    const employees = await prisma.employee.findMany({
      where: {
        locationId: { in: unitIds },
        status: "ACTIVE"
      },
      include: {
        salaryHistory: {
          orderBy: { effectiveDate: "desc" },
          take: 1
        },
        location: { include: { organization: true } },
        position: { include: { department: true } },
        country: true
      }
    });

    // 3. Process each employee
    let correlativo = 1;

    for (const emp of employees) {
      const baseSalary = Number(emp.salaryHistory[0]?.amount || 0);
      
      // Fetch incidents for this employee that link to this payroll run or overlap periods
      // For now, we'll fetch incidents linked to ANY open run that matches this employee
      const incidents = await prisma.payrollIncident.findMany({
        where: {
          employeeId: emp.id,
          payrollRun: {
            status: "OPEN" 
          }
        }
      });
      
      // Summation logic for all 20+ types
      // QAF: Mapped types correctly based on hardcoded constants. 
      const gets = (t: string) => incidents.filter(i => i.type === t);
      const sum = (t: string) => gets(t).reduce((acc, i) => acc + Number(i.amount), 0);
      const qty = (t: string) => gets(t).reduce((acc, i) => acc + Number(i.quantity || 0), 0);

      const incidentData = {
        reimbursements: sum("REINTEGRO"),
        secondPositions: sum("SEGUNDA_PLAZA"),
        bonuses: sum("BONO"),
        commissions: sum("COMISION"),
        stipends: sum("VIATICOS"),
        isssLeaveDeductionCount: qty("INCAPACIDAD_ISSS"),
        isssLeaveDeductionAmount: sum("INCAPACIDAD_ISSS"),
        unjustifiedAbsencesCount: qty("AUSENCIA_INJUSTIFICADA"),
        unjustifiedAbsencesAmount: sum("AUSENCIA_INJUSTIFICADA"),
        lateArrivalsDeduction: sum("LLEGADA_TARDE"),
        vacationDaysTaken: qty("VACACIONES_GOCE"),
        vacationDaysAmount: sum("VACACIONES_GOCE"),
        vacationBonus: sum("VACACIONES_PRIMA"),
        holidayDaysCount: qty("FESTIVIDAD_DIA"),
        holidayDaysAmount: sum("FESTIVIDAD_DIA"),
        nightHolidayHoursCount: qty("FESTIVIDAD_NOCHE"),
        nightHolidayAmount: sum("FESTIVIDAD_NOCHE"),
        totalHolidaysAmount: sum("FESTIVIDAD_MONTO"),
        restDaysWorkedCount: qty("DIA_DESCANSO"),
        restDaysWorkedAmount: sum("DIA_DESCANSO"),
        overtimeDayHoursCount: qty("EXTRA_DIURNA"),
        overtimeDayAmount: sum("EXTRA_DIURNA"),
        overtimeNightHoursCount: qty("EXTRA_NOCTURNA"),
        overtimeNightAmount: sum("EXTRA_NOCTURNA"),
        nightShiftHoursCount: qty("NOCTURNIDAD"),
        nightShiftAmount: sum("NOCTURNIDAD"),
        regencies: sum("REGENCIA"),
        extraPlanHoursCount: qty("HORA_ADICIONAL"),
        extraPlanHoursAmount: sum("HORA_ADICIONAL"),
      };

      // Calculate Total Earnings (Additions)
      const totalEarnings = baseSalary + 
        incidentData.reimbursements + 
        incidentData.secondPositions + 
        incidentData.bonuses + 
        incidentData.commissions + 
        incidentData.stipends +
        incidentData.vacationBonus +
        incidentData.vacationDaysAmount +
        incidentData.holidayDaysAmount +
        incidentData.nightHolidayAmount +
        incidentData.totalHolidaysAmount +
        incidentData.restDaysWorkedAmount +
        incidentData.overtimeDayAmount +
        incidentData.overtimeNightAmount +
        incidentData.nightShiftAmount +
        incidentData.regencies +
        incidentData.extraPlanHoursAmount;

      // Calculate Statutory Deductions
      const taxableBase = baseSalary + 
        incidentData.secondPositions + 
        incidentData.bonuses + 
        incidentData.commissions +
        incidentData.overtimeDayAmount +
        incidentData.overtimeNightAmount +
        incidentData.nightShiftAmount;

      const { isss, afp } = calculateElSalvadorStatutory(taxableBase);
      
      const taxableIncome = taxableBase - isss - afp;
      const frequency = type === 'QUINCENAL' ? 'BIWEEKLY' : type === 'SEMANAL' ? 'WEEKLY' : 'MONTHLY';
      const isr = await calculateISR(taxableIncome, emp.country.isoCode, frequency);
      
      const totalDeductions = isss + afp + isr + 
        incidentData.lateArrivalsDeduction + 
        incidentData.unjustifiedAbsencesAmount + 
        incidentData.isssLeaveDeductionAmount;

      const netPay = totalEarnings - totalDeductions;

      await prisma.payrollRunEmployee.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: emp.id,
          correlativo: correlativo++,
          baseSalary: baseSalary,
          earnedSalary: baseSalary,
          ...incidentData,
          isssHealthDeduction: isss,
          afpCrecerDeduction: afp,
          incomeTax: isr,
          totalDeductions: totalDeductions,
          netPay: netPay,
          afpStatus: "ACTIVO",
          isssStatus: emp.isssNumber || "COTIZANTE",
          planHours: 176,
          workedHours: 176,
          workedDays: 30
        }
      });

      // QAF Critical Fix: Mark the gathered incidents as PROCESSED so they don't double count next run
      if (incidents.length > 0) {
        await prisma.payrollIncident.updateMany({
          where: {
            id: { in: incidents.map(i => i.id) }
          },
          data: {
            payrollRunId: payrollRun.id // Move them to this definitive computed run
          }
        });
      }
    }

    return NextResponse.json(payrollRun);
  } catch (error) {
    console.error("Payroll Process Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
