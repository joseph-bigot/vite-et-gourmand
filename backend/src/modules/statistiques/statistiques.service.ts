import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StatistiquesService {
  constructor(private readonly dataSource: DataSource) {}

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

    return {
      nombre_commandes: Number(resume.nombre_commandes),
      chiffre_affaires: Number(resume.chiffre_affaires),
      repartition_statuts: repartition.map(
        (ligne: { statut: string | null; nombre: number | string }) => ({
          statut: ligne.statut,
          nombre: Number(ligne.nombre),
        }),
      ),
    };
  }
}
