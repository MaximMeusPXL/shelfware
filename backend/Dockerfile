# backend/Dockerfile

# Use Node.js LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json* ./

# Install dependencies only if package.json exists
RUN if [ -f package.json ]; then npm install; else echo "No package.json found, skipping npm install"; fi

# Copy application code
COPY . .

# Expose API port
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "dev"]