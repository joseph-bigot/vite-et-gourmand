import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreerMenuDto } from '../dto/creer-menu.dto.js';
import { ModifierMenuDto } from '../dto/modifier-menu.dto.js';
import { CreerPlatDto } from '../dto/creer-plat.dto.js';

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
      conditions.push(`m.nombre_minimum_personnes <= $${parametres.length}`);
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

  async findOne(id: string) {
    const menus = await this.dataSource.query(
      `
        SELECT
          m.id_menu,
          m.titre,
          m.description,
          m.prix_par_personne,
          m.nombre_minimum_personnes,
          m.stock,
          m.conditions_commande,
          m.conditions_conservation,
          t.nom AS theme,
          r.nom AS regime_alimentaire
        FROM menu m
        INNER JOIN theme t ON t.id_theme = m.id_theme
        INNER JOIN regime_alimentaire r ON r.id_regime = m.id_regime
        WHERE m.id_menu = $1
          AND m.disponible = TRUE
      `,
      [id],
    );

    const menu = menus[0];

    if (!menu) {
      return null;
    }

    const plats = await this.dataSource.query(
      `
        SELECT
          p.id_plat,
          p.nom,
          p.description,
          p.categorie,
          cm.quantite,
          cm.ordre_affichage,
          COALESCE(
            ARRAY_AGG(a.nom) FILTER (WHERE a.nom IS NOT NULL),
            ARRAY[]::VARCHAR[]
          ) AS allergenes
        FROM composer_menu cm
        INNER JOIN plat p ON p.id_plat = cm.id_plat
        LEFT JOIN plat_allergene pa ON pa.id_plat = p.id_plat
        LEFT JOIN allergene a ON a.id_allergene = pa.id_allergene
        WHERE cm.id_menu = $1
        GROUP BY
          p.id_plat,
          p.nom,
          p.description,
          p.categorie,
          cm.quantite,
          cm.ordre_affichage
        ORDER BY cm.ordre_affichage, p.categorie
      `,
      [id],
    );

    return {
      ...menu,
      plats,
    };
  }

  async listerTousPourGestion() {
    return this.dataSource.query(`
      SELECT m.id_menu, m.titre, m.description, m.prix_par_personne,
             m.nombre_minimum_personnes, m.stock, m.disponible,
             m.conditions_commande, m.conditions_conservation,
             m.id_theme, t.nom AS theme, m.id_regime,
             r.nom AS regime_alimentaire,
             COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id_plat', cm.id_plat,
                     'nom_plat', p.nom,
                     'quantite', cm.quantite,
                     'ordre_affichage', cm.ordre_affichage
                   )
                   ORDER BY cm.ordre_affichage
                 )
                 FROM composer_menu cm
                 JOIN plat p ON p.id_plat = cm.id_plat
                 WHERE cm.id_menu = m.id_menu
               ),
               '[]'::json
             ) AS plats
      FROM menu m
      JOIN theme t ON t.id_theme = m.id_theme
      JOIN regime_alimentaire r ON r.id_regime = m.id_regime
      ORDER BY m.id_menu
    `);
  }

  async listerReferences() {
    const [themes, regimes, allergenes] = await Promise.all([
      this.dataSource.query('SELECT id_theme, nom FROM theme ORDER BY nom'),
      this.dataSource.query(
        'SELECT id_regime, nom FROM regime_alimentaire ORDER BY nom',
      ),
      this.dataSource.query(
        'SELECT id_allergene, nom FROM allergene ORDER BY nom',
      ),
    ]);
    return { themes, regimes, allergenes };
  }

  async listerPlats() {
    return this.dataSource.query(`
      SELECT p.id_plat, p.nom, p.description, p.categorie,
             COALESCE(
               ARRAY_AGG(a.id_allergene) FILTER (WHERE a.id_allergene IS NOT NULL),
               ARRAY[]::BIGINT[]
             ) AS allergenes
      FROM plat p
      LEFT JOIN plat_allergene pa ON pa.id_plat = p.id_plat
      LEFT JOIN allergene a ON a.id_allergene = pa.id_allergene
      GROUP BY p.id_plat
      ORDER BY p.categorie, p.nom
    `);
  }

  async creerMenu(dto: CreerMenuDto) {
    if (!Array.isArray(dto.plats) || dto.plats.length === 0) {
      throw new BadRequestException('Un menu doit contenir au moins un plat.');
    }

    return this.dataSource.transaction(async (manager) => {
      const resultat = await manager.query(
        `INSERT INTO menu
          (id_theme, id_regime, titre, description, prix_par_personne,
           nombre_minimum_personnes, stock, conditions_commande,
           conditions_conservation, disponible)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id_menu`,
        [
          dto.id_theme,
          dto.id_regime,
          dto.titre,
          dto.description,
          dto.prix_par_personne,
          dto.nombre_minimum_personnes,
          dto.stock,
          dto.conditions_commande,
          dto.conditions_conservation,
          dto.disponible ?? true,
        ],
      );
      const idMenu = resultat[0].id_menu;

      for (const plat of dto.plats) {
        await manager.query(
          `INSERT INTO composer_menu (id_menu, id_plat, quantite, ordre_affichage)
           VALUES ($1,$2,$3,$4)`,
          [idMenu, plat.id_plat, plat.quantite, plat.ordre_affichage],
        );
      }

      return { id_menu: idMenu, message: 'Menu créé.' };
    });
  }

  async modifierMenu(id: number, dto: ModifierMenuDto) {
    const champs: Record<string, unknown> = {
      id_theme: dto.id_theme,
      id_regime: dto.id_regime,
      titre: dto.titre,
      description: dto.description,
      prix_par_personne: dto.prix_par_personne,
      nombre_minimum_personnes: dto.nombre_minimum_personnes,
      stock: dto.stock,
      conditions_commande: dto.conditions_commande,
      conditions_conservation: dto.conditions_conservation,
      disponible: dto.disponible,
    };

    const colonnesAutorisees = Object.keys(champs).filter(
      (colonne) => champs[colonne] !== undefined,
    );

    return this.dataSource.transaction(async (manager) => {
      const existe = await manager.query(
        'SELECT id_menu FROM menu WHERE id_menu = $1',
        [id],
      );
      if (!existe.length) throw new NotFoundException('Menu introuvable.');

      if (colonnesAutorisees.length) {
        const valeurs = colonnesAutorisees.map((colonne) => champs[colonne]);
        const affectations = colonnesAutorisees
          .map((colonne, index) => `${colonne} = $${index + 1}`)
          .join(', ');
        valeurs.push(id);
        await manager.query(
          `UPDATE menu SET ${affectations} WHERE id_menu = $${valeurs.length}`,
          valeurs,
        );
      }

      if (dto.plats !== undefined) {
        if (!dto.plats.length) {
          throw new BadRequestException(
            'Un menu doit contenir au moins un plat.',
          );
        }
        await manager.query('DELETE FROM composer_menu WHERE id_menu = $1', [
          id,
        ]);
        for (const plat of dto.plats) {
          await manager.query(
            `INSERT INTO composer_menu (id_menu, id_plat, quantite, ordre_affichage)
             VALUES ($1,$2,$3,$4)`,
            [id, plat.id_plat, plat.quantite, plat.ordre_affichage],
          );
        }
      }

      return { id_menu: id, message: 'Menu modifié.' };
    });
  }

  async changerDisponibilite(id: number, disponible: boolean) {
    if (typeof disponible !== 'boolean') {
      throw new BadRequestException(
        'Le champ disponible doit être un booléen.',
      );
    }
    const resultat = await this.dataSource.query(
      `UPDATE menu SET disponible = $1 WHERE id_menu = $2 RETURNING id_menu, disponible`,
      [disponible, id],
    );
    if (!resultat.length) throw new NotFoundException('Menu introuvable.');
    return resultat[0];
  }

  async supprimerMenu(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const menus = await manager.query(
        'SELECT id_menu FROM menu WHERE id_menu = $1 FOR UPDATE',
        [id],
      );

      if (!menus.length) {
        throw new NotFoundException('Menu introuvable.');
      }

      const commandes = await manager.query(
        'SELECT id_commande FROM commande WHERE id_menu = $1 LIMIT 1',
        [id],
      );

      if (commandes.length) {
        throw new BadRequestException(
          'Ce menu ne peut pas être supprimé car il est associé à une commande. Rendez-le indisponible à la place.',
        );
      }

      await manager.query('DELETE FROM menu WHERE id_menu = $1', [id]);

      return { id_menu: id, message: 'Menu supprimé.' };
    });
  }

  async supprimerPlat(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const plats = await manager.query(
        'SELECT id_plat FROM plat WHERE id_plat = $1 FOR UPDATE',
        [id],
      );

      if (!plats.length) {
        throw new NotFoundException('Plat introuvable.');
      }

      const menus = await manager.query(
        'SELECT id_menu FROM composer_menu WHERE id_plat = $1 LIMIT 1',
        [id],
      );

      if (menus.length) {
        throw new BadRequestException(
          'Ce plat est associé à un ou plusieurs menus et ne peut pas être supprimé.',
        );
      }

      await manager.query('DELETE FROM plat WHERE id_plat = $1', [id]);

      return { id_plat: id, message: 'Plat supprimé.' };
    });
  }

  async modifierPlat(id: number, dto: CreerPlatDto) {
    return this.dataSource.transaction(async (manager) => {
      const plats = await manager.query(
        'SELECT id_plat FROM plat WHERE id_plat = $1 FOR UPDATE',
        [id],
      );

      if (!plats.length) {
        throw new NotFoundException('Plat introuvable.');
      }

      await manager.query(
        `UPDATE plat
         SET nom = $1, description = $2, categorie = $3
         WHERE id_plat = $4`,
        [dto.nom, dto.description ?? null, dto.categorie, id],
      );

      await manager.query(
        'DELETE FROM plat_allergene WHERE id_plat = $1',
        [id],
      );

      for (const idAllergene of dto.allergenes ?? []) {
        await manager.query(
          'INSERT INTO plat_allergene (id_plat, id_allergene) VALUES ($1, $2)',
          [id, idAllergene],
        );
      }

      return { id_plat: id, message: 'Plat modifié.' };
    });
  }

  async creerPlat(dto: CreerPlatDto) {
    return this.dataSource.transaction(async (manager) => {
      const resultat = await manager.query(
        `INSERT INTO plat (nom, description, categorie)
         VALUES ($1,$2,$3) RETURNING id_plat`,
        [dto.nom, dto.description ?? null, dto.categorie],
      );
      const idPlat = resultat[0].id_plat;

      for (const idAllergene of dto.allergenes ?? []) {
        await manager.query(
          'INSERT INTO plat_allergene (id_plat, id_allergene) VALUES ($1,$2)',
          [idPlat, idAllergene],
        );
      }

      return { id_plat: idPlat, message: 'Plat créé.' };
    });
  }
}
