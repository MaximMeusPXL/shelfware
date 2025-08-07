# -------- STAGE 1: Build --------
    FROM node:18 AS build

    WORKDIR /app
    
    # 1) Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # 2) Generate the Prisma client
    COPY prisma ./prisma
    RUN npx prisma generate
    
    # 3) Copy the rest & build
    COPY . .
    RUN npm run build
    
    
    # -------- STAGE 2: Production --------
    FROM node:18-slim
    
    WORKDIR /app
    
    # 1) Install runtime deps (OpenSSL 3)
    RUN apt-get update \
     && apt-get install -y \
          openssl \
          ca-certificates \
          libssl3 \
     && rm -rf /var/lib/apt/lists/*
    
    # 2) Copy build output + dependencies
    COPY --from=build /app/dist         ./dist
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/package.json ./
    
    # 3) Remove the OpenSSL-1.1 Prisma engine binary so Prisma falls back to the OpenSSL-3 build
    RUN rm -f node_modules/.prisma/client/libquery_engine-debian-openssl-1.1*.so.node
    
    # 4) (Optional) Copy Prisma schema if needed at runtime
    COPY --from=build /app/prisma       ./prisma
    
    # 5) Run in production mode
    ENV NODE_ENV=production
    EXPOSE 3001
    CMD ["node", "dist/src/server.js"]
    