import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity.js';
import { UtilisateursService } from './utilisateurs.service.js';
import { UtilisateursController } from './utilisateurs.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur]),
    AuthModule,
    EmailModule,
  ],
  controllers: [UtilisateursController],
  providers: [UtilisateursService],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}