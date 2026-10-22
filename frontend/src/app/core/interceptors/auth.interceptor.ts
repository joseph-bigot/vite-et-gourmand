import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (requete, suivant) => {
  const token = localStorage.getItem('vite-gourmand-token');

  if (token) {
    requete = requete.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return suivant(requete);
};