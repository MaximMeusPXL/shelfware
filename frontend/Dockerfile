# frontend/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker build caching
COPY package*.json* ./

# Install dependencies only if package.json exists
RUN if [ -f package.json ]; then npm install; else echo "No package.json found, skipping npm install"; fi

# Bundle app source inside the Docker image
COPY . .

# Your app binds to port 3000, so expose it
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]