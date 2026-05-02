const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log("Start seeding (Final Attempt)...");
  
  // Minimal seed
  const roles = ['SuperAdmin', 'Admin', 'Colaborador']
  for (const r of roles) {
    await prisma.role.upsert({ where: { name: r }, update: {}, create: { name: r } })
  }
  
  console.log("Seed done.");
}

main().catch(console.error).finally(() => prisma.$disconnect())
