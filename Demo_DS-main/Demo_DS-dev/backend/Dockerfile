# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Generar el cliente Prisma y compilar TypeScript
RUN npx prisma generate && npm run build

# ── Stage 2: Runner ───────────────────────────────────────────────────────────
# Se copian todos los node_modules del builder (incluye ts-node para el seed)
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
# Schema y seed necesarios en runtime
COPY prisma ./prisma

EXPOSE 3000
