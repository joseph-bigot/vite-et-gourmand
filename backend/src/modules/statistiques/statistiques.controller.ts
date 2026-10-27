import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
