import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from '../services/session';

export const roleGuard: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  const utilisateur = session.utilisateur();

  if (!utilisateur) {
    return router.createUrlTree(['/connexion']);
  }

  if (utilisateur.role === 'employe' || utilisateur.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/']);
};
