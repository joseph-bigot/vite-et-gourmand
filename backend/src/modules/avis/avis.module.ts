import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avis } from './entities/avis.entity.js';
import { AvisController } from './avis.controller.js';
import { AvisService } from './avis.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Avis])],
  controllers: [AvisController],
  providers: [AvisService],
})
export class AvisModule {}
