# Stage 1: Build React application
FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:8080/api/v1
ARG VITE_IMAGE_BASE_URL=http://localhost:8080

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_IMAGE_BASE_URL=${VITE_IMAGE_BASE_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

