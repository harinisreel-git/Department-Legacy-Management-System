# Production Dockerfile for Department Legacy Management System
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies (only production packages)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure non-root user execution for security
USER node

# Production environment defaults
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
