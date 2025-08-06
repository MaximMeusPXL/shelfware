# -------- STAGE 1: Build --------
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Prisma setup
COPY prisma ./prisma
RUN npx prisma generate

# Copy rest of source
COPY . .

# Build TypeScript
RUN npm run build

# -------- STAGE 2: Production --------
FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built files & dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma

# Environment
ENV NODE_ENV=production

EXPOSE 3001

# Start app
CMD ["node", "dist/src/server.js"]

