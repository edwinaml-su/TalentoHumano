const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const p = new PrismaClient();

async function seed() {
  console.log('Seeding roles and users...');
  
  const superAdminRole = await p.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {},
    create: { name: 'SuperAdmin', description: 'Acceso total al sistema' }
  });

  const adminRole = await p.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Administrador de organización' }
  });

  await p.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: { 
      email: 'admin@empresa.com', 
      passwordHash: 'admin123', 
      roleId: superAdminRole.id,
      isActive: true
    }
  });

  console.log('Seed completed successfully');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
