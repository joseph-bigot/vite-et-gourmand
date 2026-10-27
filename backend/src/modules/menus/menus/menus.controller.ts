import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service.js';
import { CreerMenuDto } from '../dto/creer-menu.dto.js';
import { ModifierMenuDto } from '../dto/modifier-menu.dto.js';
import { CreerPlatDto } from '../dto/creer-plat.dto.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  findAll(
    @Query('theme') theme?: string,
    @Query('regime') regime?: string,
    @Query('prixMin') prixMin?: string,
    @Query('prixMax') prixMax?: string,
    @Query('nombrePersonnes') nombrePersonnes?: string,
  ) {
    return this.menusService.findAll({
      theme,
      regime,
      prixMin: prixMin !== undefined ? Number(prixMin) : undefined,
      prixMax: prixMax !== undefined ? Number(prixMax) : undefined,
      nombrePersonnes:
        nombrePersonnes !== undefined ? Number(nombrePersonnes) : undefined,
    });
  }

  @Get('gestion/tous')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  listerTousPourGestion() {
    return this.menusService.listerTousPourGestion();
  }

  @Get('gestion/references')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  listerReferences() {
    return this.menusService.listerReferences();
  }

  @Get('gestion/plats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  listerPlats() {
    return this.menusService.listerPlats();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  creerMenu(@Body() dto: CreerMenuDto) {
    return this.menusService.creerMenu(dto);
  }

  @Patch(':id/disponibilite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  changerDisponibilite(
    @Param('id', ParseIntPipe) id: number,
    @Body('disponible') disponible: boolean,
  ) {
    return this.menusService.changerDisponibilite(id, disponible);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  modifierMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModifierMenuDto,
  ) {
    return this.menusService.modifierMenu(id, dto);
  }

  @Post('plats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employe', 'admin')
  creerPlat(@Body() dto: CreerPlatDto) {
    return this.menusService.creerPlat(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const menu = await this.menusService.findOne(id);
    if (!menu) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('Menu introuvable');
    }
    return menu;
  }
}
