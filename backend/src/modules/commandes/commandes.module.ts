
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './entities/commande.entity.js';
import { EmailModule } from '../email/email.module.js';
import { CommandesService } from './commandes.service.js';
import { CommandesController } from './commandes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Commande]), EmailModule],
  controllers: [CommandesController],
  providers: [CommandesService],
})
export class CommandesModule {}
