# Stage 1: Build React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build succeeded
RUN test -f dist/index.html || (echo "ERROR: Build failed, index.html not found" && exit 1)

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy runtime config script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files were copied
RUN test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found" && exit 1)

# Expose port
EXPOSE 80

# Use custom entrypoint to inject environment variables
ENTRYPOINT ["/docker-entrypoint.sh"]

