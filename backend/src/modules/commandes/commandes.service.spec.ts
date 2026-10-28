import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandesService } from './commandes.service.js';

describe('CommandesService - changements de statut et stock', () => {
  let service: CommandesService;
  let managerQuery: ReturnType<typeof vi.fn>;

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
    );
  });

  it('accepte une commande et décrémente le stock disponible', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'en_attente' }])
      .mockResolvedValueOnce([{
        id_menu: '5',
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '10.90',
      }])
      .mockResolvedValueOnce([{ stock: 2 }])
      .mockResolvedValueOnce([{ stock: 1 }])
      .mockResolvedValueOnce([]);

    await expect(
      service.changerStatutCommande('12', 'acceptee'),
    ).resolves.toEqual({
      message: 'Statut de la commande mis à jour.',
    });

    expect(managerQuery).toHaveBeenCalledWith(
      'UPDATE menu SET stock = stock - 1 WHERE id_menu = $1 AND stock > 0 RETURNING stock',
      ['5'],
    );
    expect(managerQuery).toHaveBeenCalledWith(
      'INSERT INTO historique_statut (id_commande, statut) VALUES ($1, $2)',
      ['12', 'acceptee'],
    );
  });

  it('refuse une commande lorsque les frais de livraison sont incohérents', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'en_attente' }])
      .mockResolvedValueOnce([{
        id_menu: '5',
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '5.00',
      }]);

    await expect(
      service.changerStatutCommande('12', 'acceptee'),
    ).rejects.toThrow(BadRequestException);

    expect(managerQuery).toHaveBeenCalledTimes(3);
  });

  it('refuse une commande lorsque le stock est épuisé', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'en_attente' }])
      .mockResolvedValueOnce([{
        id_menu: '5',
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '10.90',
      }])
      .mockResolvedValueOnce([{ stock: 0 }]);

    await expect(
      service.changerStatutCommande('12', 'acceptee'),
    ).rejects.toThrow(BadRequestException);

    expect(managerQuery).not.toHaveBeenCalledWith(
      'INSERT INTO historique_statut (id_commande, statut) VALUES ($1, $2)',
      ['12', 'acceptee'],
    );
  });

  it('refuse une transition de statut invalide', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'en_attente' }]);

    await expect(
      service.changerStatutCommande('12', 'terminee'),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('CommandesService - annulation par un employé et restitution du stock', () => {
  let service: CommandesService;
  let managerQuery: ReturnType<typeof vi.fn>;

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
    );
  });

  it('restitue le stock lors de l’annulation d’une commande acceptée', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'acceptee' }])
      .mockResolvedValueOnce([{
        id_menu: '5',
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '10.90',
      }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(
      service.annulerCommandeParEmploye('12', 'Indisponibilité', 'Téléphone'),
    ).resolves.toEqual({ message: 'Commande annulée avec succès.' });

    expect(managerQuery).toHaveBeenCalledWith(
      'UPDATE menu SET stock = stock + 1 WHERE id_menu = $1',
      ['5'],
    );
  });

  it('ne restitue pas le stock pour une commande encore en attente', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'en_attente' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(
      service.annulerCommandeParEmploye('12', 'Annulation', 'Téléphone'),
    ).resolves.toEqual({ message: 'Commande annulée avec succès.' });

    expect(managerQuery).not.toHaveBeenCalledWith(
      'UPDATE menu SET stock = stock + 1 WHERE id_menu = $1',
      ['5'],
    );
  });

  it('empêche une seconde annulation et toute restitution supplémentaire', async () => {
    managerQuery
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'acceptee' }])
      .mockResolvedValueOnce([{
        id_menu: '5',
        distance_km: '10.00',
        livraison_hors_bordeaux: true,
        frais_livraison: '10.90',
      }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id_commande: '12' }])
      .mockResolvedValueOnce([{ statut: 'annulee' }]);

    await service.annulerCommandeParEmploye(
      '12',
      'Indisponibilité',
      'Téléphone',
    );

    await expect(
      service.annulerCommandeParEmploye('12', 'Nouvelle annulation', 'Email'),
    ).rejects.toThrow(BadRequestException);

    expect(
      managerQuery.mock.calls.filter(
        ([sql]) => sql === 'UPDATE menu SET stock = stock + 1 WHERE id_menu = $1',
      ),
    ).toHaveLength(1);
  });
});
