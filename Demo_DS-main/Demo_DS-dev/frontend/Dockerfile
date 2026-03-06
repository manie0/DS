# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Nginx ────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine
# Copiar el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html
# Configuración personalizada: SPA routing + proxy al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
