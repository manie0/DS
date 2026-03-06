import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SingletonController } from './singleton/singleton.controller';
import { SingletonService } from './singleton/singleton.service';

@Module({
  imports: [],
  controllers: [SingletonController],
  providers: [PrismaService, SingletonService],
})
export class AppModule {}
