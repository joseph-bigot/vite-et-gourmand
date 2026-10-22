
import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { MenusService } from './menus.service.js';

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const menu = await this.menusService.findOne(id);

    if (!menu) {
      throw new NotFoundException('Menu introuvable');
    }

    return menu;
  }
}
