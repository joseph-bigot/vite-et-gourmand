import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HorairesService, type Horaire } from './horaires.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('horaires')
export class HorairesController {
  constructor(private readonly horairesService: HorairesService) {}

  @Get()
  lister() {
    return this.horairesService.lister();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  modifier(@Body() horaires: Horaire[]) {
    return this.horairesService.modifier(horaires);
  }
}
