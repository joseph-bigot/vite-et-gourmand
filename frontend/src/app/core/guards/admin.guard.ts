import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from '../services/session';

export const adminGuard: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  const utilisateur = session.utilisateur();

  if (!utilisateur) {
    return router.createUrlTree(['/connexion']);
  }

  if (utilisateur.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/']);
};
