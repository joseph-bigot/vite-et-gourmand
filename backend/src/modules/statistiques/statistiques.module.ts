import { Module } from '@nestjs/common';
import { StatistiquesService } from './statistiques.service.js';
import { StatistiquesController } from './statistiques.controller.js';
import { MongoDbService } from './mongodb.service.js';

@Module({
  controllers: [StatistiquesController],
  providers: [StatistiquesService, MongoDbService],
  exports: [StatistiquesService, MongoDbService],
})
export class StatistiquesModule {}
