// OBSOLETE - replaced by prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with a default connection string
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"
    }
  }
});

// Sample initial project data
const initialProject = {
  title: "Shelfware Tracker",
  status: "Completed",
  description: "A full-stack application designed to help developers track their side projects and prevent them from becoming shelfware. Built as an educational example for PXL Hogeschool students.",
  githubUrl: "https://github.com/PXL-Digital-Application-Samples/shelfware",
  deployedUrl: "https://shelfware.pxl.be",
  docsUrl: "https://github.com/PXL-Digital-Application-Samples/shelfware#readme",
  hardwareInfo: {
    "frontend": "React 18 with TypeScript",
    "backend": "Express with Node.js",
    "database": "PostgreSQL 15",
    "containerization": "Docker with docker compose",
    "styling": "Custom CSS with light/dark themes"
  }
};

async function main() {
  try {
    console.log('Starting database initialization...');
    console.log('Using default local database connection');
    
    // Note: You'll need to run migrations separately:
    // npx prisma migrate dev --name init
    console.log('Note: Make sure to run migrations before this script:');
    console.log('npx prisma migrate dev --name init');
    
    // Connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check if we already have projects
    const existingProjects = await prisma.project.count();
    
    if (existingProjects === 0) {
      console.log('No existing projects found. Creating initial project...');
      
      // Create initial project
      const project = await prisma.project.create({
        data: initialProject
      });
      
      console.log(`✅ Initial project created with ID: ${project.id}`);
    } else {
      console.log(`📋 Found ${existingProjects} existing projects. Skipping seed data.`);
    }
    
    console.log('✨ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

main().then(() => {
  console.log('Script completed');
}).catch(error => {
  console.error('Script failed:', error);
});