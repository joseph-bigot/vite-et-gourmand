import { Module } from '@nestjs/common';
import { StatistiquesService } from './statistiques.service.js';
import { StatistiquesController } from './statistiques.controller.js';

@Module({
  controllers: [StatistiquesController],
  providers: [StatistiquesService],
  exports: [StatistiquesService],
})
export class StatistiquesModule {}
