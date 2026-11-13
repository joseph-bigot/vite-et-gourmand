import { Injectable, signal } from '@angular/core';

export interface UtilisateurConnecte {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresse?: string | null;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Session {
  private readonly cleSession = 'vite-gourmand-utilisateur';

  readonly utilisateur = signal<UtilisateurConnecte | null>(
    this.chargerUtilisateur(),
  );

  get estConnecte(): boolean {
    return this.utilisateur() !== null;
  }

  enregistrerUtilisateur(utilisateur: UtilisateurConnecte): void {
    localStorage.setItem(this.cleSession, JSON.stringify(utilisateur));
    this.utilisateur.set(utilisateur);
  }

deconnecter(): void {
  localStorage.removeItem(this.cleSession);
  localStorage.removeItem('vite-gourmand-token');
  this.utilisateur.set(null);
}

  private chargerUtilisateur(): UtilisateurConnecte | null {
    try {
      const donnees = localStorage.getItem(this.cleSession);
      return donnees ? (JSON.parse(donnees) as UtilisateurConnecte) : null;
    } catch {
      return null;
    }
  }
}