import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MongoDbService } from './mongodb.service.js';

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

  async obtenirStatistiques() {
    const [resume] = await this.dataSource.query(`
      SELECT
        COUNT(*)::int AS nombre_commandes,
        COALESCE(
          SUM(
            CASE
              WHEN dernier.statut NOT IN ('annulee', 'refusee')
              THEN commande.prix_total
              ELSE 0
            END
          ),
          0
        )::numeric(12, 2) AS chiffre_affaires
      FROM commande
      LEFT JOIN LATERAL (
        SELECT h.statut
        FROM historique_statut h
        WHERE h.id_commande = commande.id_commande
        ORDER BY h.date_changement DESC, h.id_historique DESC
        LIMIT 1
      ) dernier ON TRUE
    `);

    const repartition = await this.dataSource.query(`
      SELECT
        dernier.statut,
        COUNT(*)::int AS nombre
      FROM commande
      LEFT JOIN LATERAL (
        SELECT h.statut
        FROM historique_statut h
        WHERE h.id_commande = commande.id_commande
        ORDER BY h.date_changement DESC, h.id_historique DESC
        LIMIT 1
      ) dernier ON TRUE
      GROUP BY dernier.statut
      ORDER BY dernier.statut NULLS FIRST
    `);

    const collection = this.mongoDbService
      .getDb()
      .collection('statistiques_commandes');

    const parMenu = await collection
      .aggregate([
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
      ])
      .toArray();

    return {
      nombre_commandes: Number(resume.nombre_commandes),
      chiffre_affaires: Number(resume.chiffre_affaires),
      repartition_statuts: repartition.map(
        (ligne: { statut: string | null; nombre: number | string }) => ({
          statut: ligne.statut,
          nombre: Number(ligne.nombre),
        }),
      ),
      statistiques_par_menu: parMenu,
    };
  }
}
