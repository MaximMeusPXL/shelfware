"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const users = [
    {
        email: 'demo@example.com',
        password: 'password123',
        name: 'Demo User',
    },
    {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
    },
];
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
// Create or skip users
function seedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('👥 Seeding users...');
        for (const user of users) {
            const existing = yield prisma.user.findUnique({ where: { email: user.email } });
            if (existing) {
                console.log(`📌 User already exists: ${user.email}`);
                continue;
            }
            const hashedPassword = yield bcrypt_1.default.hash(user.password, 10);
            const created = yield prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name,
                    password: hashedPassword,
                },
            });
            console.log(`✅ Created user: ${created.email}`);
        }
    });
}
// Create projects and assign them to the demo user
function seedProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📦 Seeding projects...');
        const demoUser = yield prisma.user.findUnique({
            where: { email: 'demo@example.com' },
        });
        if (!demoUser) {
            throw new Error('❌ Demo user not found. Seed users first.');
        }
        for (const project of projects) {
            try {
                const existing = yield prisma.project.findFirst({
                    where: { title: project.title },
                });
                if (existing) {
                    console.log(`📌 Project already exists: ${project.title}`);
                    continue;
                }
                const created = yield prisma.project.create({
                    data: Object.assign(Object.assign({}, project), { userId: demoUser.id }),
                });
                console.log(`✅ Created project: ${created.title}`);
            }
            catch (err) {
                console.warn(`⚠️ Failed to create project "${project.title}":`, err);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting full seed...');
        yield seedUsers();
        yield seedProjects();
        console.log('🎉 Seeding complete!');
    });
}
main()
    .catch((e) => {
    console.error('🔥 Seeding failed:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
