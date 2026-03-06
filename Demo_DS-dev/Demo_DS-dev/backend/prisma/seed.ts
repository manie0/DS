/**
 * Seed: crea datos de prueba para el módulo Observer.
 * Genera 2 tanques con sus umbrales configurados.
 * Ejecutar con: npm run prisma:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ── Tanque 1: Tanque Norte ────────────────────────────────────────────────
  const tank1 = await prisma.tank.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Tanque Norte',
      capacityLiters: 1000,
      geometry: 'cilindrico',
      location: 'Planta Norte – Sector A',
    },
  });

  await prisma.tankThreshold.upsert({
    where: { tankId: tank1.id },
    update: {},
    create: {
      tankId: tank1.id,
      minLevel: 100,      // Alerta NIVEL_BAJO  < 100 L  (10 %)
      criticalMin: 50,    // Alerta NIVEL_CRITICO < 50 L  (5 %)
      maxLevel: 900,      // Alerta NIVEL_ALTO   > 900 L  (90 %)
      leakThreshold: 5,   // POSIBLE_FUGA si cae > 5 L/min
    },
  });

  console.log(`✅ Tanque 1 creado: ${tank1.name} (${tank1.capacityLiters} L)`);

  // ── Tanque 2: Tanque Sur ──────────────────────────────────────────────────
  const tank2 = await prisma.tank.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Tanque Sur',
      capacityLiters: 500,
      geometry: 'rectangular',
      location: 'Planta Sur – Sector B',
    },
  });

  await prisma.tankThreshold.upsert({
    where: { tankId: tank2.id },
    update: {},
    create: {
      tankId: tank2.id,
      minLevel: 50,       // Alerta NIVEL_BAJO   < 50 L   (10 %)
      criticalMin: 25,    // Alerta NIVEL_CRITICO < 25 L   (5 %)
      maxLevel: 450,      // Alerta NIVEL_ALTO   > 450 L  (90 %)
      leakThreshold: 3,   // POSIBLE_FUGA si cae > 3 L/min
    },
  });

  console.log(`✅ Tanque 2 creado: ${tank2.name} (${tank2.capacityLiters} L)`);

  console.log('\n📊 Resumen de umbrales:');
  console.log('  Tanque Norte: Crítico <50L | Bajo <100L | Alto >900L | Fuga >5L/min');
  console.log('  Tanque Sur  : Crítico <25L | Bajo <50L  | Alto >450L | Fuga >3L/min');
  console.log('\n🎉 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
