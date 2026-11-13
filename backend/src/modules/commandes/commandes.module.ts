
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './entities/commande.entity.js';
import { EmailModule } from '../email/email.module.js';
import { CommandesService } from './commandes.service.js';
import { CommandesController } from './commandes.controller.js';
import { StatistiquesModule } from '../statistiques/statistiques.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Commande]), EmailModule, StatistiquesModule],
  controllers: [CommandesController],
  providers: [CommandesService],
})
export class CommandesModule {}
