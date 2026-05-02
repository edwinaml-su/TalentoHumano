import { PrismaClient } from '../src/generated/client'
import "dotenv/config";

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding detailed Payroll records...")

  // 1. Ensure we have an organization and employees
  const org = await prisma.organization.findFirst()
  if (!org) {
    console.log("No organization found. Please run main seed first.")
    return
  }

  const employees = await prisma.employee.findMany({
    include: {
      location: true,
      position: { include: { department: true } }
    },
    take: 10
  })

  // 2. Create a Payroll Run
  const payrollRun = await prisma.payrollRun.create({
    data: {
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-15'),
      status: 'PROCESSED',
      payrollType: 'QUINCENAL',
    }
  })

  // 3. Create records for each employee
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const baseSal = Number(emp.employeeCode === 'EMP-001' ? 2500 : 1200)
    
    await prisma.payrollRunEmployee.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: emp.id,
        correlativo: i + 1,
        afpStatus: 'ACTIVO',
        isssStatus: emp.isssNumber || '12345678',
        
        baseSalary: baseSal,
        planHours: 176,
        workedHours: 176,
        workedDays: 15,
        earnedSalary: baseSal / 2, // Quincenal
        
        // Random some extras
        overtimeDayHoursCount: i % 2 === 0 ? 5 : 0,
        overtimeDayAmount: i % 2 === 0 ? 45.50 : 0,
        
        bonuses: i % 3 === 0 ? 100 : 0,
        
        // Deductions
        isssHealthDeduction: (baseSal / 2) * 0.03,
        afpCrecerDeduction: (baseSal / 2) * 0.0725,
        incomeTax: (baseSal / 2) * 0.10,
        
        totalBenefits: (baseSal / 2) + (i % 2 === 0 ? 45.50 : 0) + (i % 3 === 0 ? 100 : 0),
        totalDeductions: ((baseSal / 2) * 0.03) + ((baseSal / 2) * 0.0725) + ((baseSal / 2) * 0.10),
        netPay: (baseSal / 2) + 45.50 + 100 - (20 + 50 + 80) // rough estimation
      }
    })
  }

  console.log(`Seeding complete. Created Payroll Run ID: ${payrollRun.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
