# syntax=docker/dockerfile:1
# Vite + React PWA — Node 20 (alpine: Debian mirror muammosidan xoli)
FROM node:20-alpine

WORKDIR /app

# Build context = ./pwa (see docker-compose.yml)
# Install deps first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source (see .dockerignore for exclusions: node_modules, dist, .env)
COPY . ./

EXPOSE 5173

# Dev server. Proxy target api uchun VITE_PROXY_TARGET env orqali beriladi (docker-compose).
# Production build uchun: `npm run build` -> dist/ (deploy.sh/nginx tomonidan tarqatiladi).
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
