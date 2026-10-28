import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
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
  obtenirStatistiques(
    @Query('menuId') menuId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    if (dateDebut && Number.isNaN(Date.parse(dateDebut))) {
      throw new BadRequestException('Le paramètre dateDebut est invalide.');
    }

    if (dateFin && Number.isNaN(Date.parse(dateFin))) {
      throw new BadRequestException('Le paramètre dateFin est invalide.');
    }

    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      throw new BadRequestException(
        'dateDebut doit être antérieure ou égale à dateFin.',
      );
    }

    return this.statistiquesService.obtenirStatistiques({
      menuId,
      dateDebut,
      dateFin,
    });
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
