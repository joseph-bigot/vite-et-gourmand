
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service.js';
import { InscriptionDto } from './dto/inscription.dto.js';
import { ConnexionDto } from './dto/connexion.dto.js';
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreationEmployeDto } from './dto/creation-employe.dto.js';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(
    private readonly utilisateursService: UtilisateursService,
    private readonly authService: AuthService,
  ) {}

  @Post('inscription')
  @HttpCode(HttpStatus.CREATED)
  inscrire(@Body() donnees: InscriptionDto) {
    return this.utilisateursService.inscrire(donnees);
  }


  @Post('employes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  creerEmploye(@Body() donnees: CreationEmployeDto) {
    return this.utilisateursService.creerEmploye(donnees);
  }


  @Patch('employes/:id/desactiver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  desactiverEmploye(@Param('id') id: string) {
    return this.utilisateursService.desactiverEmploye(id);
  }

  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  async connecter(@Body() donnees: ConnexionDto) {
    const utilisateur = await this.utilisateursService.connecter(donnees);

    const accessToken = this.authService.genererJeton({
      id_utilisateur: utilisateur.id_utilisateur,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    return {
      utilisateur,
      access_token: accessToken,
    };
  }
}
