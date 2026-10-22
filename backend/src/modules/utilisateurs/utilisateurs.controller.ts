
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service.js';
import { InscriptionDto } from './dto/inscription.dto.js';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(
    private readonly utilisateursService: UtilisateursService,
  ) {}

  @Post('inscription')
  @HttpCode(HttpStatus.CREATED)
  inscrire(@Body() donnees: InscriptionDto) {
    return this.utilisateursService.inscrire(donnees);
  }
}
