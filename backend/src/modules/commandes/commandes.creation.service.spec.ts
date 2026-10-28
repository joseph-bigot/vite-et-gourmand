import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandesService } from './commandes.service.js';

describe('CommandesService - création et frais de livraison', () => {
  let service: CommandesService;
  let managerQuery: ReturnType<typeof vi.fn>;
  let managerSave: ReturnType<typeof vi.fn>;
  let envoyerEmail: ReturnType<typeof vi.fn>;

  const donnees = {
    id_menu: '5',
    date_prestation: '2026-11-15',
    heure_prestation: '12:00',
    adresse_livraison: '10 rue Sainte-Catherine, 33000 Bordeaux',
    lieu_prestation: 'Salle de réception',
    nombre_personnes: 10,
    distance_km: 10,
    livraison_hors_bordeaux: true,
  };

  beforeEach(() => {
    managerQuery = vi.fn();
    managerSave = vi.fn().mockResolvedValue({ id_commande: '12' });
    envoyerEmail = vi.fn().mockResolvedValue(undefined);

    const manager = {
      query: managerQuery,
      save: managerSave,
    };

    const dataSource = {
      transaction: vi.fn(async (callback) => callback(manager)),
    };

    const commandesRepository = {
      create: vi.fn((commande) => commande),
    };

    service = new CommandesService(
      commandesRepository as any,
      dataSource as any,
      { envoyerEmail } as any,
    );
  });

  it('calcule les frais et le total côté serveur', async () => {
    managerQuery
      .mockResolvedValueOnce([
        {
          id_menu: '5',
          prix_par_personne: '20.00',
          nombre_minimum_personnes: 5,
          disponible: true,
        },
      ])
      .mockResolvedValueOnce([]);

    const resultat = await service.creerCommande('7', donnees, 'client@test.fr');

    expect(resultat.detail_prix).toEqual({
      prix_menu: 200,
      montant_reduction: 20,
      frais_livraison: 10.9,
      prix_total: 190.9,
    });

    expect(managerSave).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '10.90',
        prix_total: '190.90',
      }),
    );
  });

  it('refuse une distance négative', async () => {
    await expect(
      service.creerCommande(
        '7',
        { ...donnees, distance_km: -1 },
        'client@test.fr',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(managerQuery).not.toHaveBeenCalled();
  });
});
