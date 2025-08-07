# -------- STAGE 1: Build --------
    FROM node:18 AS build

    WORKDIR /app
    
    # 1) Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # 2) Generate the Prisma client
    COPY prisma ./prisma
    RUN npx prisma generate
    
    # 3) Copy the rest of your source and build
    COPY . .
    RUN npm run build
    
    
    # -------- STAGE 2: Production --------
    FROM node:18-slim
    
    WORKDIR /app
    
    # 1) Pull in the runtime libraries Prisma needs
    RUN apt-get update \
     && apt-get install -y \
          openssl \
          ca-certificates \
          libssl1.1 \
     && rm -rf /var/lib/apt/lists/*
    
    # 2) Copy in your build output and dependencies
    COPY --from=build /app/dist       ./dist
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/package.json ./
    
    # 3) Remove the OpenSSL-3 Prisma engine so only the 1.1 version remains
    RUN rm -f node_modules/.prisma/client/libquery_engine-debian-openssl-3.0*.so.node
    
    # 4) (Optional) Copy your Prisma schema if you need it at runtime
    COPY --from=build /app/prisma     ./prisma
    
    # 5) Set production env and start
    ENV NODE_ENV=production
    EXPOSE 3001
    CMD ["node", "dist/src/server.js"]
    