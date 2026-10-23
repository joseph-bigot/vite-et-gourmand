import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CommandeClient {
  id_commande: number;
  date_commande: string;
  date_prestation: string;
  heure_prestation: string;
  nombre_personnes: number;
  prix_total: number;
  statut: string;
  titre_menu: string;
  adresse_livraison: string;
  lieu_prestation: string;
}

@Injectable({
  providedIn: 'root',
})
export class Commandes {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/commandes';

  trouverMesCommandes(): Observable<CommandeClient[]> {
    return this.http.get<CommandeClient[]>(
      `${this.apiUrl}/mes-commandes`,
    );
  }

  annulerCommande(
    idCommande: number,
    motif: string,
    moyen_contact: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${idCommande}/annuler`,
      { motif, moyen_contact },
    );
  }

  modifierCommande(
    idCommande: number,
    donnees: {
      date_prestation: string;
      heure_prestation: string;
      adresse_livraison: string;
      lieu_prestation: string;
      nombre_personnes: number;
    },
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${idCommande}`,
      donnees,
    );
  }
}
