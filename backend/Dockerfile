# ── Stage 1: Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the TypeScript code (compiles to /dist and resolves aliases)
RUN npm run build

# ── Stage 2: Production Runtime ───────────────────────────────────
FROM node:20-alpine AS production

# Set Node environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled output from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs
USER nodejs

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
