# syntax=docker/dockerfile:1
# ── Frontend production image ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build production bundle
COPY . .
RUN npm run build

# ── Serve with nginx ──────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runtime

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing & API proxy: forward /api to backend service and fallback to index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location /api/ {\n    proxy_pass http://backend:8000/api/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /health {\n    proxy_pass http://backend:8000/health;\n  }\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
