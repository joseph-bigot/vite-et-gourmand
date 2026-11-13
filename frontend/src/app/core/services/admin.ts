import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from './api.config';

export interface StatistiquesParMenu {
  menuId: string;
  titreMenu: string;
  nombreCommandes: number;
  chiffreAffaires: number;
}

export interface StatistiquesAdmin {
  nombre_commandes: number;
  chiffre_affaires: number;
  repartition_statuts: {
    statut: string | null;
    nombre: number;
  }[];
  statistiques_par_menu: StatistiquesParMenu[];
  filtres_appliques?: {
    menuId: string | null;
    dateDebut: string | null;
    dateFin: string | null;
  };
}

export interface EmployeCree {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
}

export interface FiltresStatistiquesAdmin {
  menuId?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  obtenirStatistiques(
    filtres: FiltresStatistiquesAdmin = {},
  ): Observable<StatistiquesAdmin> {
    let params = new HttpParams();

    if (filtres.menuId) params = params.set('menuId', filtres.menuId);
    if (filtres.dateDebut) params = params.set('dateDebut', filtres.dateDebut);
    if (filtres.dateFin) params = params.set('dateFin', filtres.dateFin);

    return this.http.get<StatistiquesAdmin>(`${API_URL}/statistiques`, {
      params,
    });
  }

  obtenirEmployes(): Observable<EmployeCree[]> {
    return this.http.get<EmployeCree[]>(`${API_URL}/utilisateurs/employes`);
  }

  creerEmploye(donnees: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
  }): Observable<EmployeCree> {
    return this.http.post<EmployeCree>(
      `${API_URL}/utilisateurs/employes`,
      donnees,
    );
  }

  desactiverEmploye(id: number): Observable<EmployeCree> {
    return this.http.patch<EmployeCree>(
      `${API_URL}/utilisateurs/employes/${id}/desactiver`,
      {},
    );
  }

  activerEmploye(id: number): Observable<EmployeCree> {
    return this.http.patch<EmployeCree>(
      `${API_URL}/utilisateurs/employes/${id}/activer`,
      {},
    );
  }

  supprimerEmploye(id: number): Observable<{ id_utilisateur: number; message: string }> {
    return this.http.delete<{ id_utilisateur: number; message: string }>(
      `${API_URL}/utilisateurs/employes/${id}`,
    );
  }

}
