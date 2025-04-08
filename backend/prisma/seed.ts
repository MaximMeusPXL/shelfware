import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample project records
const projects = [
  {
    title: "Shelfware Tracker",
    status: "Completed",
    description: "A full-stack application designed to help developers track their side projects and prevent them from becoming shelfware. Built as an educational example for PXL Hogeschool students.",
    githubUrl: "https://github.com/PXL-Digital-Application-Samples/shelfware",
    deployedUrl: "https://shelfware.pxl.be",
    docsUrl: "https://github.com/PXL-Digital-Application-Samples/shelfware#readme",
    hardwareInfo: {
      frontend: "React 18 with TypeScript",
      backend: "Express with Node.js",
      database: "PostgreSQL 15",
      containerization: "Docker with docker compose",
      styling: "Custom CSS with light/dark themes"
    }
  },
  {
    title: "4-bit CPU",
    status: "In Progress",
    description: "An educational 4-bit CPU built from scratch using software emulation and later implemented on an iCE40 FPGA. Designed to teach the basics of instruction sets, registers, and memory addressing.",
    deployedUrl: "",
    hardwareInfo: {
      architecture: "Harvard (separate instruction/data memory)",
      emulator: "C with terminal blinkenlights",
      fpga: "iCESugar board (iCE40UP5K)",
      memory: "256 bytes RAM, 32-word program memory",
      tools: "Yosys, nextpnr, iverilog, GTKWave"
    }
  },
  {
    title: "Smart Light Controller",
    status: "Planning",
    description: "A prototype app to control multiple smart lights via MQTT and a browser-based interface. Eventually intended to be voice controlled and integrated with Home Assistant.",
    githubUrl: "https://github.com/user/smart-light-controller",
    deployedUrl: "",
    docsUrl: "",
    hardwareInfo: {
      frontend: "Vue 3 with Tailwind CSS",
      backend: "Node.js with MQTT.js",
      database: "None yet",
      containerization: "Docker",
      devices: "ESP8266, WS2812B LEDs"
    }
  },
  {
    title: "CLI Habit Tracker",
    status: "In Progress",
    description: "A terminal-based habit tracker written in Rust, designed to help developers build and maintain good daily routines. Features include color-coded streaks, emoji feedback, and CSV export for analysis.",
    deployedUrl: "",
    hardwareInfo: {
      language: "Rust",
      interface: "TUI with Crossterm",
      storage: "Local JSON and CSV export",
      platform: "Cross-platform",
      styling: "Box-drawing + ANSI colors"
    }
  }
  
];

async function main() {
  console.log('Seeding database...');
  
  for (const project of projects) {
    try {
      const created = await prisma.project.create({ data: project });
      console.log(`✅ Project created: ${created.title} (ID: ${created.id})`);
    } catch (error) {
      console.warn(`⚠️ Skipped "${project.title}" — possibly already exists or error occurred.`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
