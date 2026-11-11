import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface HistoriqueStatutCommande {
  statut: string;
  date_changement: string;
}

export interface CommandeEmploye {
  id_commande: number;
  date_commande: string;
  date_prestation: string;
  heure_prestation: string;
  nombre_personnes: number;
  adresse_livraison: string;
  distance_km: string;
  livraison_hors_bordeaux: boolean;
  frais_livraison: string;
  lieu_prestation: string;
  prix_total: number;
  nom_client: string;
  prenom_client: string;
  email_client: string;
  telephone_client: string | null;
  titre_menu: string;
  statut: string;
}

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

  trouverToutesLesCommandes(): Observable<CommandeEmploye[]> {
    return this.http.get<CommandeEmploye[]>(`${this.apiUrl}/toutes`);
  }

  changerStatutCommande(
    idCommande: number,
    statut: string,
    motif?: string,
    moyen_contact?: string,
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${idCommande}/statut`,
      { statut, motif, moyen_contact },
    );
  }

  annulerCommandeParEmploye(
    idCommande: number,
    motif: string,
    moyen_contact: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${idCommande}/annuler-employe`,
      { motif, moyen_contact },
    );
  }

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

  trouverHistoriqueCommande(idCommande: number): Observable<HistoriqueStatutCommande[]> {
    return this.http.get<HistoriqueStatutCommande[]>(
      `${this.apiUrl}/${idCommande}/historique`
    );
  }

}
