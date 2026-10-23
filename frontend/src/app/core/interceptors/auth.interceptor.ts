import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (requete, suivant) => {
  const estConnexion = requete.url.endsWith('/utilisateurs/connexion');

  const token = localStorage.getItem('vite-gourmand-token');

  if (token && !estConnexion) {
    requete = requete.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return suivant(requete);
};