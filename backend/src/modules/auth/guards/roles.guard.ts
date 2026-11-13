import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesAutorises = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesAutorises || rolesAutorises.length === 0) {
      return true;
    }

    const requete = context.switchToHttp().getRequest<{
      user?: { role?: string };
    }>();

    if (!requete.user || !rolesAutorises.includes(requete.user.role ?? '')) {
      throw new ForbiddenException(
        'Vous n’avez pas les droits nécessaires pour cette action.',
      );
    }

    return true;
  }
}
