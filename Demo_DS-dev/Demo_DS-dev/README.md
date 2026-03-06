# Lecturas y Alertas de Tanques – Patrón Observer

> **Grupo 6 – Diseño de Software**
> Módulo implementado: **Observer** (Alertas por cambios de nivel/umbrales)

---

## Descripción del Patrón Observer implementado

El **patrón Observer** (también llamado *Publish-Subscribe*) define una dependencia uno-a-muchos entre objetos, de forma que cuando un objeto (**Sujeto**) cambia de estado, todos sus dependientes (**Observadores**) son notificados y actualizados automáticamente.

### ¿Por qué Observer en este sistema?

Cuando un tanque recibe una nueva lectura de sensor y su nivel cruza un umbral configurado (vacío, crítico, alto, lleno, posible fuga), **el sistema debe notificar automáticamente** a múltiples destinatarios (base de datos, logs, consola) sin que la lógica de evaluación conozca los detalles de cada receptor.

---

## Clases involucradas

```
ITankObservable          ← Interfaz del Sujeto
ITankObserver            ← Interfaz del Observador
TankAlertEvent           ← Objeto de evento propagado
AlertType                ← Enum de tipos de alerta

TankLevelSubject         ← Sujeto concreto (implementa ITankObservable)
  ├── subscribe()
  ├── unsubscribe()
  ├── notify()
  └── evaluateReading()  ← lógica de umbral → construye eventos → notify()

DatabaseAlertObserver    ← Observador #1: persiste en PostgreSQL
LoggerAlertObserver      ← Observador #2: NestJS Logger (warn/error)
ConsoleNotificationObserver ← Observador #3: banner ASCII en consola
```

### Flujo de ejecución

```
POST /alerts/evaluate
       │
       ▼
AlertsService.evaluate()
  → busca umbrales en BD
       │
       ▼
TankLevelSubject.evaluateReading()   ← SUJETO
  → compara nivel vs umbrales
  → construye TankAlertEvent(s)
  → llama notify(event)
       │
       ├──▶ DatabaseAlertObserver.update()    → INSERT en tabla Alert
       ├──▶ LoggerAlertObserver.update()      → NestJS Logger
       └──▶ ConsoleNotificationObserver.update() → banner en consola
       │
       ▼
retorna [ TankAlertEvent[] ]  →  respuesta HTTP 200
```

---

## Stack tecnológico

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Backend    | NestJS 10 + TypeScript (strict)     |
| ORM        | Prisma 5 + PostgreSQL               |
| Validación | class-validator + class-transformer |
| Frontend   | React 18 + TypeScript + Vite 5      |
| Estilos    | CSS puro (sin dependencias UI)      |

---

## Estructura de carpetas

```
Demo_DS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos: Tank, TankThreshold, Alert
│   │   └── seed.ts                # Datos de prueba (2 tanques)
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma/
│       │   ├── prisma.service.ts
│       │   └── prisma.module.ts
│       └── observer/              ← MÓDULO PRINCIPAL
│           ├── observer.module.ts  ← Importar en AppModule de compañeros
│           ├── interfaces/
│           │   ├── tank-alert-event.interface.ts
│           │   ├── tank-observer.interface.ts
│           │   └── tank-observable.interface.ts
│           ├── observers/
│           │   ├── database-alert.observer.ts
│           │   ├── logger-alert.observer.ts
│           │   └── console-notification.observer.ts
│           ├── subjects/
│           │   └── tank-level.subject.ts
│           └── alerts/
│               ├── alerts.controller.ts
│               ├── alerts.service.ts
│               ├── alerts.module.ts
│               └── dto/
│                   ├── evaluate-reading.dto.ts
│                   ├── filter-alert.dto.ts
│                   ├── create-threshold.dto.ts
│                   └── create-tank.dto.ts
└── frontend/
    └── src/
        ├── App.tsx                # UI principal
        ├── api.ts                 # Llamadas al backend
        ├── types.ts               # Tipos TypeScript
        └── index.css              # Estilos
```

---

## Instalación y configuración

### Opción A – Docker (recomendado, un solo comando)

```bash
docker compose up --build
```

Esto levanta los tres servicios automáticamente:
- **db** → PostgreSQL 16 en `localhost:5432`
- **backend** → NestJS en `http://localhost:3000` (aplica migraciones y seed al arrancar)
- **frontend** → React servido por nginx en `http://localhost:5173`

Para detener y eliminar los contenedores:
```bash
docker compose down          # conserva los datos
docker compose down -v       # también elimina el volumen de PostgreSQL
```

---

### Opción B – Ejecución local (sin Docker)

#### Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clonar el repositorio

```bash
git clone <url-repo>
cd Demo_DS
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
# Editar .env con las credenciales de PostgreSQL:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tanques_db"
```

Crear la base de datos, ejecutar migraciones y seed:

```bash
npm run prisma:migrate      # Crea las tablas en PostgreSQL
npm run prisma:seed         # Inserta 2 tanques de prueba con umbrales
```

Iniciar el servidor:

```bash
npm run start:dev           # Modo desarrollo (hot-reload)
# o
npm run start:prod          # Producción (requiere npm run build primero)
```

El servidor estará disponible en `http://localhost:3000`.

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
npm run dev
```

La UI estará disponible en `http://localhost:5173`.

---

## Variables de entorno

| Variable       | Descripción                        | Ejemplo                                          |
|----------------|------------------------------------|--------------------------------------------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL      | `postgresql://user:pass@localhost:5432/tanques_db` |
| `PORT`         | Puerto del servidor NestJS         | `3000`                                           |

---

## Endpoints REST

### Alertas (patrón Observer)

| Método  | Ruta                        | Descripción                                      |
|---------|-----------------------------|--------------------------------------------------|
| `POST`  | `/alerts/evaluate`          | Evalúa una lectura y dispara el Observer         |
| `GET`   | `/alerts`                   | Lista alertas (filtros: tankId, alertType, resolved) |
| `GET`   | `/alerts/active`            | Solo alertas no resueltas                        |
| `GET`   | `/alerts/:id`               | Detalle de una alerta                            |
| `PATCH` | `/alerts/:id/resolve`       | Marcar alerta como resuelta                      |
| `GET`   | `/alerts/tank/:tankId`      | Historial de alertas de un tanque                |

### Setup (configuración para pruebas)

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|------------------------------------|
| `POST` | `/setup/tanks`              | Crear un tanque                    |
| `GET`  | `/setup/tanks`              | Listar todos los tanques           |
| `POST` | `/setup/thresholds`         | Crear/actualizar umbrales          |
| `GET`  | `/setup/thresholds/:tankId` | Ver umbrales de un tanque          |

---

## Ejemplos de uso (cURL)

### Evaluar una lectura con nivel crítico

```bash
curl -X POST http://localhost:3000/alerts/evaluate \
  -H "Content-Type: application/json" \
  -d '{"tankId": 1, "levelLiters": 30, "percentage": 3}'
```

**Respuesta esperada:** alerta `NIVEL_CRITICO` generada y persistida.

### Evaluar posible fuga (caída de 200L en 10 minutos → 20L/min > umbral 5L/min)

```bash
curl -X POST http://localhost:3000/alerts/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "tankId": 1,
    "levelLiters": 500,
    "percentage": 50,
    "previousLevelLiters": 700,
    "minutesSinceLastReading": 10
  }'
```

### Listar alertas activas

```bash
curl http://localhost:3000/alerts/active
```

### Resolver una alerta

```bash
curl -X PATCH http://localhost:3000/alerts/1/resolve
```

---

## Integración con los módulos de compañeros

Para integrar este módulo con el **Singleton** y el **Adapter**, importar `ObserverModule` en el `AppModule` del proyecto combinado:

```typescript
import { ObserverModule } from './observer/observer.module';
import { SingletonModule } from './singleton/singleton.module'; // Compañero 1
import { AdapterModule }   from './adapter/adapter.module';    // Compañero 2

@Module({
  imports: [ObserverModule, SingletonModule, AdapterModule],
})
export class AppModule {}
```

El `ObserverModule` es completamente independiente: no depende de Singleton ni Adapter. Los compañeros pueden llamar al `AlertsService` o al `TankLevelSubject` directamente si sus módulos necesitan disparar alertas:

```typescript
// Ejemplo: el AdapterModule dispara alertas al recibir datos de un sensor
constructor(private readonly alertsService: AlertsService) {}

async onNewSensorReading(reading: SensorData) {
  await this.alertsService.evaluate({
    tankId:      reading.tankId,
    levelLiters: reading.levelLiters,
    percentage:  reading.percentage,
  });
}
```

---

## Comandos útiles

```bash
# Backend
npm run start:dev        # Servidor con hot-reload
npm run build            # Compilar TypeScript
npm run prisma:studio    # Explorar la BD visualmente
npm run prisma:reset     # Resetear BD y re-seedear

# Frontend
npm run dev              # Servidor de desarrollo Vite
npm run build            # Build de producción
```

---

## Autores

| Patrón    | Responsable | Descripción                            |
|-----------|-------------|----------------------------------------|
| Singleton | Compañero 1 | Configuración/calibración global       |
| Adapter   | Compañero 2 | Adaptación de sensores/protocolos      |
| **Observer** | **Yo** | **Alertas por cambios de nivel/umbrales** |
