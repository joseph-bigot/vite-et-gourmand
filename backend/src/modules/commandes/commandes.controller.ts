
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CommandesService } from './commandes.service.js';

interface RequeteAuthentifiee extends Request {
  user: {
    id_utilisateur: string;
    email: string;
    role: string;
  };
}

interface DonneesCreationCommande {
  id_menu: string;
  date_prestation: string;
  heure_prestation: string;
  adresse_livraison: string;
  lieu_prestation: string;
  nombre_personnes: number;
  distance_km: number;
  livraison_hors_bordeaux: boolean;
}

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(
    private readonly commandesService: CommandesService,
  ) {}

  @Get('mes-commandes')
  trouverMesCommandes(@Req() requete: RequeteAuthentifiee) {
    return this.commandesService.trouverParUtilisateur(
      requete.user.id_utilisateur,
    );
  }

  @Post()
  creerCommande(
    @Req() requete: RequeteAuthentifiee,
    @Body() donnees: DonneesCreationCommande,
  ) {
    return this.commandesService.creerCommande(
      requete.user.id_utilisateur,
      donnees,
    );
  }
}
