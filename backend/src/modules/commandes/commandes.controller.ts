import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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

interface DonneesAnnulationCommande {
  motif: string;
  moyen_contact: string;
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

  @Post(':id/annuler')
  annulerCommande(
    @Req() requete: RequeteAuthentifiee,
    @Param('id') idCommande: string,
    @Body() donnees: DonneesAnnulationCommande,
  ) {
    return this.commandesService.annulerCommande(
      requete.user.id_utilisateur,
      idCommande,
      donnees.motif,
      donnees.moyen_contact,
    );
  }

  @Put(':id')
  modifierCommande(
    @Req() requete: RequeteAuthentifiee,
    @Param('id') idCommande: string,
    @Body()
    donnees: {
      date_prestation: string;
      heure_prestation: string;
      adresse_livraison: string;
      lieu_prestation: string;
      nombre_personnes: number;
    },
  ) {
    return this.commandesService.modifierCommande(
      requete.user.id_utilisateur,
      idCommande,
      donnees,
    );
  }

}
