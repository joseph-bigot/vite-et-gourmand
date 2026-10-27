import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvisService } from './avis.service.js';

describe('AvisService - modération', () => {
  let service: AvisService;
  let avisRepository: any;

  beforeEach(() => {
    avisRepository = {
      createQueryBuilder: vi.fn(),
      exists: vi.fn(),
    };

    service = new AvisService(avisRepository, {} as any);
  });

  function preparerMiseAJour(affected: number) {
    const queryBuilder = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected }),
    };

    avisRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    return queryBuilder;
  }

  it('approuve un avis en attente', async () => {
    preparerMiseAJour(1);

    await expect(service.modererAvis('12', 'approuve')).resolves.toEqual({
      message: 'Avis approuvé.',
    });
  });

  it('rejette un avis en attente', async () => {
    preparerMiseAJour(1);

    await expect(service.modererAvis('12', 'rejete')).resolves.toEqual({
      message: 'Avis rejeté.',
    });
  });

  it('refuse un identifiant invalide', async () => {
    await expect(service.modererAvis('abc', 'approuve')).rejects.toThrow(
      BadRequestException,
    );
    expect(avisRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('refuse un statut invalide', async () => {
    await expect(
      service.modererAvis('12', 'en_attente' as any),
    ).rejects.toThrow(BadRequestException);
    expect(avisRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('signale un avis inexistant', async () => {
    preparerMiseAJour(0);
    avisRepository.exists.mockResolvedValue(false);

    await expect(service.modererAvis('999', 'approuve')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('refuse un avis déjà modéré', async () => {
    preparerMiseAJour(0);
    avisRepository.exists.mockResolvedValue(true);

    await expect(service.modererAvis('12', 'rejete')).rejects.toThrow(
      BadRequestException,
    );
  });
});
