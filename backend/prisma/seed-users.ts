// backend/prisma/seed-users.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Sample user records
const users = [
  {
    email: 'demo@example.com',
    password: 'password123', // Will be hashed
    name: 'Demo User',
  },
  {
    email: 'admin@example.com',
    password: 'admin123', // Will be hashed
    name: 'Admin User',
  },
];

async function main() {
  console.log('Seeding users...');
  
  for (const userData of users) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists, skipping...`);
        continue;
      }
      
      // Create the user with hashed password
      const created = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });
      
      console.log(`✅ User created: ${created.email} (ID: ${created.id})`);
    } catch (error) {
      console.warn(`⚠️ Skipped "${userData.email}" — error occurred:`, error);
    }
  }

  console.log('User seeding complete!');
}

main()
  .catch((e) => {
    console.error('User seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });