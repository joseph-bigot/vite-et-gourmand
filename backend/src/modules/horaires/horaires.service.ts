import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface Horaire {
  jour_semaine: number;
  heure_ouverture: string | null;
  heure_fermeture: string | null;
  ferme: boolean;
}

@Injectable()
export class HorairesService {
  constructor(private readonly dataSource: DataSource) {}

  async lister(): Promise<Horaire[]> {
    return this.dataSource.query(`
      SELECT
        jour_semaine,
        TO_CHAR(heure_ouverture, 'HH24:MI') AS heure_ouverture,
        TO_CHAR(heure_fermeture, 'HH24:MI') AS heure_fermeture,
        ferme
      FROM horaire
      ORDER BY jour_semaine
    `);
  }

  async modifier(horaires: Horaire[]): Promise<{ message: string }> {
    if (!Array.isArray(horaires) || horaires.length !== 7) {
      throw new BadRequestException(
        'Les horaires des sept jours de la semaine sont obligatoires.',
      );
    }

    const jours = new Set<number>();
    const formatHeure = /^([01]\d|2[0-3]):[0-5]\d$/;

    for (const horaire of horaires) {
      if (
        !Number.isInteger(horaire.jour_semaine) ||
        horaire.jour_semaine < 1 ||
        horaire.jour_semaine > 7 ||
        jours.has(horaire.jour_semaine)
      ) {
        throw new BadRequestException(
          'Chaque jour doit être renseigné une seule fois.',
        );
      }

      jours.add(horaire.jour_semaine);

      if (typeof horaire.ferme !== 'boolean') {
        throw new BadRequestException(
          'Le statut de fermeture doit être un booléen.',
        );
      }

      if (
        !horaire.ferme &&
        (typeof horaire.heure_ouverture !== 'string' ||
          typeof horaire.heure_fermeture !== 'string' ||
          !formatHeure.test(horaire.heure_ouverture) ||
          !formatHeure.test(horaire.heure_fermeture) ||
          horaire.heure_fermeture <= horaire.heure_ouverture)
      ) {
        throw new BadRequestException(
          'Les heures doivent être valides et la fermeture après l’ouverture.',
        );
      }
    }

    await this.dataSource.transaction(async (manager) => {
      for (const horaire of horaires) {
        await manager.query(
          `INSERT INTO horaire (
            jour_semaine, heure_ouverture, heure_fermeture, ferme
          ) VALUES ($1, $2, $3, $4)
          ON CONFLICT (jour_semaine) DO UPDATE SET
            heure_ouverture = EXCLUDED.heure_ouverture,
            heure_fermeture = EXCLUDED.heure_fermeture,
            ferme = EXCLUDED.ferme`,
          [
            horaire.jour_semaine,
            horaire.ferme ? null : horaire.heure_ouverture,
            horaire.ferme ? null : horaire.heure_fermeture,
            horaire.ferme,
          ],
        );
      }
    });

    return { message: 'Les horaires ont été enregistrés.' };
  }
}
