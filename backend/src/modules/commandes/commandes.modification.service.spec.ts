import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandesService } from './commandes.service.js';

describe('CommandesService - modification et frais de livraison', () => {
  let service: CommandesService;
  let managerQuery: ReturnType<typeof vi.fn>;

  const donnees = {
    date_prestation: '2026-11-15',
    heure_prestation: '12:00',
    adresse_livraison: '10 rue Sainte-Catherine, 33000 Bordeaux',
    lieu_prestation: 'Salle de réception',
    nombre_personnes: 10,
  };

  beforeEach(() => {
    managerQuery = vi.fn();
    const manager = { query: managerQuery };
    const dataSource = {
      transaction: vi.fn(async (callback) => callback(manager)),
    };

    service = new CommandesService(
      {} as any,
      dataSource as any,
      {} as any,
      { synchroniserCommande: vi.fn().mockResolvedValue(undefined) } as any,
    );
  });

  it('refuse une modification lorsque l’adresse de livraison change', async () => {
    managerQuery.mockResolvedValueOnce([
      {
        id_commande: '12',
        id_menu: '5',
        adresse_livraison: '10 rue Sainte-Catherine, 33000 Bordeaux',
        frais_livraison: '5.00',
        distance_km: '0.00',
        livraison_hors_bordeaux: false,
      },
    ]);

    await expect(
      service.modifierCommande('7', '12', {
        ...donnees,
        adresse_livraison: '20 rue de la Paix, 33000 Bordeaux',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(managerQuery).toHaveBeenCalledTimes(1);
  });

  it('autorise la suite du traitement lorsque l’adresse est inchangée', async () => {
    managerQuery
      .mockResolvedValueOnce([
        {
          id_commande: '12',
          id_menu: '5',
          adresse_livraison: '10 rue Sainte-Catherine, 33000 Bordeaux',
          frais_livraison: '5.00',
          distance_km: '0.00',
          livraison_hors_bordeaux: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          prix_par_personne: '20.00',
          nombre_minimum_personnes: 5,
          disponible: true,
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      service.modifierCommande('7', '12', donnees),
    ).resolves.toMatchObject({
      message: 'Commande modifiée avec succès.',
      detail_prix: {
        prix_menu: 200,
        montant_reduction: 20,
        frais_livraison: 5,
        prix_total: 185,
      },
    });

    expect(managerQuery).toHaveBeenCalledTimes(3);
  });
});
