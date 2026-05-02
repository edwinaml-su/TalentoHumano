import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function migrate() {
  console.log("🔒 Starting password migration to Bcrypt...");

  const users = await prisma.user.findMany();
  
  for (const user of users) {
    // Check if looks like a hash (bcrypt hashes start with $2b$ or $2a$)
    if (user.passwordHash.startsWith('$2')) {
      console.log(`- Skipping ${user.email} (already hashed)`);
      continue;
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(user.passwordHash, saltRounds);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashed }
    });
    
    console.log(`✅ Hashed password for ${user.email}`);
  }

  console.log("🎉 Migration complete!");
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
