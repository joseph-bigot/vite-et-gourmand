
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface FiltresMenus {
  theme?: string;
  regime?: string;
  prixMin?: number;
  prixMax?: number;
  nombrePersonnes?: number;
}

@Injectable()
export class MenusService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(filtres: FiltresMenus = {}) {
    const conditions = ['m.disponible = TRUE'];
    const parametres: (string | number)[] = [];

    if (filtres.theme) {
      parametres.push(filtres.theme);
      conditions.push(`t.nom = $${parametres.length}`);
    }

    if (filtres.regime) {
      parametres.push(filtres.regime);
      conditions.push(`r.nom = $${parametres.length}`);
    }

    if (filtres.prixMin !== undefined && Number.isFinite(filtres.prixMin)) {
      parametres.push(filtres.prixMin);
      conditions.push(`m.prix_par_personne >= $${parametres.length}`);
    }

    if (filtres.prixMax !== undefined && Number.isFinite(filtres.prixMax)) {
      parametres.push(filtres.prixMax);
      conditions.push(`m.prix_par_personne <= $${parametres.length}`);
    }

    if (
      filtres.nombrePersonnes !== undefined &&
      Number.isFinite(filtres.nombrePersonnes)
    ) {
      parametres.push(filtres.nombrePersonnes);
      conditions.push(
        `m.nombre_minimum_personnes <= $${parametres.length}`,
      );
    }

    return this.dataSource.query(
      `
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
        WHERE ${conditions.join(' AND ')}
        ORDER BY m.id_menu
      `,
      parametres,
    );
  }
}
