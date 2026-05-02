import { PrismaClient } from '@prisma/client'
import "dotenv/config";

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Attendance records...")

  const employees = await prisma.employee.findMany({ take: 5 })
  const shift = await prisma.shift.findFirst() || await prisma.shift.create({
    data: {
      name: 'Turno Administrativo',
      startTime: '08:00',
      endTime: '17:00',
      organizationId: (await prisma.organization.findFirst())?.id || 'error',
    }
  })

  const today = new Date()
  today.setHours(0,0,0,0)

  for (const emp of employees) {
    const clockIn = new Date(today)
    clockIn.setHours(7, 50 + Math.floor(Math.random() * 20), 0) // Randomly around 8:00

    const isLate = clockIn.getHours() >= 8 && clockIn.getMinutes() > 15

    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: today,
        clockIn: clockIn,
        shiftId: shift.id,
        status: isLate ? 'LATE' : 'PRESENT',
        lateMinutes: isLate ? 5 + Math.floor(Math.random() * 10) : 0,
        location: 'Oficina Central'
      }
    })
  }

  console.log("Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
