# Módulo Singleton - Lecturas y Alertas de Tanques

Implementación del patrón **Singleton (creacional)** para la configuración/calibración global del sistema, usando **NestJS + Prisma + PostgreSQL** y una UI en **React**.

## Qué cubre este módulo

- **Patrón Singleton:** una sola configuración global (`GlobalTankConfig`) con `id=1`.
- **Prisma ORM:** esquema y migración para PostgreSQL.
- **API REST (NestJS):**
  - `GET /api/singleton/config` → obtiene/crea la config global.
  - `PATCH /api/singleton/config` → actualiza campos de calibración.
  - `POST /api/singleton/config/reset` → reinicia valores por defecto.
- **Frontend React:** formulario para consultar, editar y resetear la configuración singleton.

## Ejecutar con Docker

```bash
docker compose up --build
```

Servicios:
- Frontend: `http://localhost:4173`
- API pública (opcional): `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`

> En Docker, el frontend usa proxy interno `'/api' -> api:3000`, por lo que no depende de `localhost:3000` del navegador.

Si cambias imágenes/base de Docker, reconstruye con:

```bash
docker compose build --no-cache api
docker compose up
```

## Variables de entorno

Backend (ver `backend/.env.example`):

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/tanques?schema=public
```

Frontend (opcional, para despliegues fuera de Docker):

```env
VITE_API_URL=http://localhost:3000/api
```

## Ejecutar local sin Docker (opcional)

Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

En modo local `vite dev`, `/api` se proxea automáticamente a `http://localhost:3000`.
