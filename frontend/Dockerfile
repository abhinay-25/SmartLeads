# ── Stage 1: Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# We define the API URL as an ARG so it can be passed during build
# Default is /api to leverage the Nginx reverse proxy
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Vite application (outputs to /dist)
RUN npm run build

# ── Stage 2: Nginx Static Server ──────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
