
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll() {
    return this.dataSource.query(`
      SELECT
        m.id_menu,
        m.titre,
        m.description,
        m.prix_par_personne,
        m.nombre_minimum_personnes,
        m.stock,
        t.nom AS theme,
        r.nom AS regime_alimentaire
      FROM menu m
      INNER JOIN theme t ON t.id_theme = m.id_theme
      INNER JOIN regime_alimentaire r ON r.id_regime = m.id_regime
      WHERE m.disponible = TRUE
      ORDER BY m.id_menu
    `);
  }
}
