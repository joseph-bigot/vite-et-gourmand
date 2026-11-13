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
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AvisService } from './avis.service.js';
import { CreerAvisDto } from './dto/creer-avis.dto.js';
import { ModererAvisDto } from './dto/moderer-avis.dto.js';

interface RequeteAuthentifiee extends Request {
  user: {
    id_utilisateur: string;
    role: string;
  };
}

@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Get('public')
  trouverAvisApprouves() {
    return this.avisService.trouverAvisApprouves();
  }

  @Get('a-moderer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  trouverAvisEnAttente() {
    return this.avisService.trouverAvisEnAttente();
  }

  @Put(':id/moderation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  modererAvis(
    @Param('id') idAvis: string,
    @Body() donnees: ModererAvisDto,
  ) {
    return this.avisService.modererAvis(idAvis, donnees.statut);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  creerAvis(
    @Req() requete: RequeteAuthentifiee,
    @Body() donnees: CreerAvisDto,
  ) {
    return this.avisService.creerAvis(
      requete.user.id_utilisateur,
      donnees,
    );
  }
}
