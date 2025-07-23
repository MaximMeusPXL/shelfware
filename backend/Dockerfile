# -------- STAGE 1: Build --------
    FROM node:18 AS build

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Prisma setup (incl. engine build voor juiste target)
    COPY prisma ./prisma
    RUN npx prisma generate
    
    # Copy rest of the source code
    COPY . .
    
    # Build de TypeScript code naar dist/
    RUN npm run build
    
    # -------- STAGE 2: Production --------
    FROM node:18-slim
    
    WORKDIR /app
    
    # Installeer OpenSSL
    RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
    
    # Copy built app and dependencies
    COPY --from=build /app/dist ./dist
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/dist/prisma ./dist/prisma
    COPY --from=build /app/package*.json ./
    
    # Copy Prisma client assets
    COPY --from=build /app/prisma ./prisma
    
    # Set runtime environment
    ENV NODE_ENV=production
    
    # Expose backend port
    EXPOSE 3001
    
    # Start de backend
    CMD ["npm", "start"]
    