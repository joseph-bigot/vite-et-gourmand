import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const handler = () => undefined;
  const controller = class {};

  function creerContexte(role?: string): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({
          user: role === undefined ? undefined : { role },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  function creerGuard(rolesAutorises?: string[]) {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(rolesAutorises),
    } as unknown as Reflector;

    return new RolesGuard(reflector);
  }

  it('autorise un utilisateur dont le rôle est autorisé', () => {
    const guard = creerGuard(['admin', 'employe']);

    expect(guard.canActivate(creerContexte('employe'))).toBe(true);
  });

  it('refuse un utilisateur dont le rôle n’est pas autorisé', () => {
    const guard = creerGuard(['admin']);

    expect(() => guard.canActivate(creerContexte('client'))).toThrow(
      ForbiddenException,
    );
  });

  it('refuse une requête sans utilisateur lorsque des rôles sont exigés', () => {
    const guard = creerGuard(['admin']);

    expect(() => guard.canActivate(creerContexte())).toThrow(
      ForbiddenException,
    );
  });

  it('autorise une route sans restriction de rôle', () => {
    const guard = creerGuard();

    expect(guard.canActivate(creerContexte())).toBe(true);
  });

  it('autorise une route dont la liste des rôles est vide', () => {
    const guard = creerGuard([]);

    expect(guard.canActivate(creerContexte())).toBe(true);
  });

});
