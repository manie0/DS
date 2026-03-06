import { Module } from '@nestjs/common';
import { ObserverModule } from './observer/observer.module';

/**
 * AppModule raíz de la aplicación.
 *
 * Para integrar con los módulos de los compañeros:
 *   import { ObserverModule } from './observer/observer.module';
 *   imports: [ObserverModule, SingletonModule, AdapterModule]
 */
@Module({
  imports: [
    // ← Módulo Observer (Grupo 6 – Patrón Observer)
    ObserverModule,
  ],
})
export class AppModule {}
