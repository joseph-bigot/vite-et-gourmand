
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CommandesService } from './commandes.service.js';

@Controller('commandes')
export class CommandesController {
  constructor(
    private readonly commandesService: CommandesService,
  ) {}

  @Get('utilisateur/:idUtilisateur')
  trouverParUtilisateur(
    @Param('idUtilisateur') idUtilisateur: string,
  ) {
    return this.commandesService.trouverParUtilisateur(idUtilisateur);
  }
}
