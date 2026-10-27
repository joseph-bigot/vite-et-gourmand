import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AvisPublic {
  id_avis: string;
  note: number;
  commentaire: string;
  date_creation: string;
  auteur: string;
}

export interface AvisAModerer {
  id_avis: string;
  id_commande: string;
  note: number;
  commentaire: string;
  date_creation: string;
  prenom_client: string;
  nom_client: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/avis';

  trouverAvisPublics(): Observable<AvisPublic[]> {
    return this.http.get<AvisPublic[]>(`${this.apiUrl}/public`);
  }

  trouverAvisAModerer(): Observable<AvisAModerer[]> {
    return this.http.get<AvisAModerer[]>(`${this.apiUrl}/a-moderer`);
  }

  creerAvis(donnees: {
    id_commande: string;
    note: number;
    commentaire: string;
  }) {
    return this.http.post<{ message: string }>(this.apiUrl, donnees);
  }

  modererAvis(idAvis: string, statut: 'approuve' | 'rejete') {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${idAvis}/moderation`,
      { statut },
    );
  }
}
