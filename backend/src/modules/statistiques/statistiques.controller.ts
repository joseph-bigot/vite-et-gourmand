import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { StatistiquesService } from './statistiques.service.js';

@Controller('statistiques')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StatistiquesController {
  constructor(
    private readonly statistiquesService: StatistiquesService,
  ) {}

  @Get()
  obtenirStatistiques() {
    return this.statistiquesService.obtenirStatistiques();
  }

  @Post('synchroniser')
  async synchroniserCommandes() {
    const nombre =
      await this.statistiquesService.synchroniserCommandes();

    return {
      message: 'Synchronisation des statistiques terminée.',
      nombre_commandes_synchronisees: nombre,
    };
  }
}
