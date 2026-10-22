
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity.js';
import { UtilisateursService } from './utilisateurs.service.js';
import { UtilisateursController } from './utilisateurs.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  controllers: [UtilisateursController],
  providers: [UtilisateursService],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}
