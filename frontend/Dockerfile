# --- STAGE 1: Build ---
FROM node:18 AS build
WORKDIR /app

# Set the API URL to be baked into the build
# You can override this during `docker build` with --build-arg
ARG VITE_API_URL=http://shelfware-test.local/api
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build with the API URL baked in
COPY . .
RUN npm run build

# --- STAGE 2: Serve static content ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

