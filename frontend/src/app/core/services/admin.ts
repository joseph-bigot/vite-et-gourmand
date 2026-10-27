import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000';

export interface StatistiquesAdmin {
  nombre_commandes: number;
  chiffre_affaires: number;
  repartition_statuts: {
    statut: string | null;
    nombre: number;
  }[];
}

export interface EmployeCree {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  obtenirStatistiques(): Observable<StatistiquesAdmin> {
    return this.http.get<StatistiquesAdmin>(`${API_URL}/statistiques`);
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
}
