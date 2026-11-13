import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MongoDbService } from './mongodb.service.js';

export interface FiltresStatistiques {
  menuId?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable()
export class StatistiquesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mongoDbService: MongoDbService,
  ) {}

  async synchroniserCommandes(): Promise<number> {
    const commandes: Array<{
      id_commande: string;
      id_menu: string;
      titre_menu: string;
      date_commande: Date;
      prix_total: string;
      statut: string | null;
    }> = await this.dataSource.query(`
      SELECT
        c.id_commande::text AS id_commande,
        c.id_menu::text AS id_menu,
        m.titre AS titre_menu,
        c.date_commande,
        c.prix_total::text AS prix_total,
        dernier.statut
      FROM commande c
      JOIN menu m ON m.id_menu = c.id_menu
      LEFT JOIN LATERAL (
        SELECT h.statut
        FROM historique_statut h
        WHERE h.id_commande = c.id_commande
        ORDER BY h.date_changement DESC, h.id_historique DESC
        LIMIT 1
      ) dernier ON TRUE
      ORDER BY c.id_commande
    `);

    const collection = this.mongoDbService
      .getDb()
      .collection('statistiques_commandes');

    if (commandes.length === 0) {
      await collection.deleteMany({});
      return 0;
    }

    const operations = commandes.map((commande) => ({
      updateOne: {
        filter: { commandeId: commande.id_commande },
        update: {
          $set: {
            commandeId: commande.id_commande,
            menuId: commande.id_menu,
            titreMenu: commande.titre_menu,
            dateCommande: new Date(commande.date_commande),
            montant: Number(commande.prix_total),
            statut: commande.statut ?? null,
          },
        },
        upsert: true,
      },
    }));

    await collection.bulkWrite(operations);

    await collection.deleteMany({
      commandeId: {
        $nin: commandes.map((commande) => commande.id_commande),
      },
    });

    return commandes.length;
  }

  async synchroniserCommande(idCommande: string): Promise<void> {
    const commandes: Array<{
      id_commande: string;
      id_menu: string;
      titre_menu: string;
      date_commande: Date;
      prix_total: string;
      statut: string | null;
    }> = await this.dataSource.query(
      `
        SELECT
          c.id_commande::text AS id_commande,
          c.id_menu::text AS id_menu,
          m.titre AS titre_menu,
          c.date_commande,
          c.prix_total::text AS prix_total,
          dernier.statut
        FROM commande c
        JOIN menu m ON m.id_menu = c.id_menu
        LEFT JOIN LATERAL (
          SELECT h.statut
          FROM historique_statut h
          WHERE h.id_commande = c.id_commande
          ORDER BY h.date_changement DESC, h.id_historique DESC
          LIMIT 1
        ) dernier ON TRUE
        WHERE c.id_commande = $1
      `,
      [idCommande],
    );

    const collection = this.mongoDbService
      .getDb()
      .collection('statistiques_commandes');

    const commande = commandes[0];

    if (!commande) {
      await collection.deleteOne({ commandeId: idCommande });
      return;
    }

    await collection.updateOne(
      { commandeId: commande.id_commande },
      {
        $set: {
          commandeId: commande.id_commande,
          menuId: commande.id_menu,
          titreMenu: commande.titre_menu,
          dateCommande: new Date(commande.date_commande),
          montant: Number(commande.prix_total),
          statut: commande.statut ?? null,
        },
      },
      { upsert: true },
    );
  }

  async obtenirStatistiques(filtres: FiltresStatistiques = {}) {
    const dateDebut = filtres.dateDebut
      ? new Date(filtres.dateDebut)
      : undefined;
    const dateFin = filtres.dateFin
      ? new Date(filtres.dateFin)
      : undefined;

    if (dateFin && /^\d{4}-\d{2}-\d{2}$/.test(filtres.dateFin ?? '')) {
      dateFin.setUTCHours(23, 59, 59, 999);
    }

    if (dateDebut && Number.isNaN(dateDebut.getTime())) {
      throw new BadRequestException('Le paramètre dateDebut est invalide.');
    }

    if (dateFin && Number.isNaN(dateFin.getTime())) {
      throw new BadRequestException('Le paramètre dateFin est invalide.');
    }

    if (dateDebut && dateFin && dateDebut > dateFin) {
      throw new BadRequestException(
        'dateDebut doit être antérieure ou égale à dateFin.',
      );
    }

    const filtreMongo: Record<string, unknown> = {};

    if (filtres.menuId) {
      filtreMongo.menuId = filtres.menuId;
    }

    if (dateDebut || dateFin) {
      const plage: Record<string, Date> = {};
      if (dateDebut) plage.$gte = dateDebut;
      if (dateFin) plage.$lte = dateFin;
      filtreMongo.dateCommande = plage;
    }

    const collection = this.mongoDbService
      .getDb()
      .collection('statistiques_commandes');

    const pipeline = [
      { $match: filtreMongo },
      {
        $facet: {
          resume: [
            {
              $group: {
                _id: null,
                nombre_commandes: { $sum: 1 },
                chiffre_affaires: {
                  $sum: {
                    $cond: [
                      { $not: [{ $in: ['$statut', ['annulee', 'refusee']] }] },
                      '$montant',
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                nombre_commandes: 1,
                chiffre_affaires: { $round: ['$chiffre_affaires', 2] },
              },
            },
          ],
          repartition_statuts: [
            {
              $group: {
                _id: '$statut',
                nombre: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                statut: '$_id',
                nombre: 1,
              },
            },
          ],
          statistiques_par_menu: [
            {
              $group: {
                _id: {
                  menuId: '$menuId',
                  titreMenu: '$titreMenu',
                },
                nombreCommandes: { $sum: 1 },
                chiffreAffaires: {
                  $sum: {
                    $cond: [
                      { $not: [{ $in: ['$statut', ['annulee', 'refusee']] }] },
                      '$montant',
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                menuId: '$_id.menuId',
                titreMenu: '$_id.titreMenu',
                nombreCommandes: 1,
                chiffreAffaires: { $round: ['$chiffreAffaires', 2] },
              },
            },
            { $sort: { titreMenu: 1 } },
          ],
        },
      },
    ];

    const [resultat] = await collection.aggregate(pipeline).toArray();

    const resume = resultat?.resume?.[0] ?? {
      nombre_commandes: 0,
      chiffre_affaires: 0,
    };

    return {
      nombre_commandes: Number(resume.nombre_commandes),
      chiffre_affaires: Number(resume.chiffre_affaires),
      repartition_statuts: (resultat?.repartition_statuts ?? []).map(
        (ligne: { statut: string | null; nombre: number | string }) => ({
          statut: ligne.statut,
          nombre: Number(ligne.nombre),
        }),
      ),
      statistiques_par_menu: resultat?.statistiques_par_menu ?? [],
      filtres_appliques: {
        menuId: filtres.menuId ?? null,
        dateDebut: filtres.dateDebut ?? null,
        dateFin: filtres.dateFin ?? null,
      },
    };
  }
}
