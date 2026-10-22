
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service.js';
import { InscriptionDto } from './dto/inscription.dto.js';
import { ConnexionDto } from './dto/connexion.dto.js';
import { AuthService } from '../auth/auth.service.js';

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
