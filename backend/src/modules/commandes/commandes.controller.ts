
import {
  Controller,
  Get,
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
}
