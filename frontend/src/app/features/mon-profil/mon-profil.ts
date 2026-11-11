import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { Session, UtilisateurConnecte } from '../../core/services/session';

interface ReponseProfil {
  utilisateur: UtilisateurConnecte;
  access_token: string;
}

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-profil.html',
  styleUrl: './mon-profil.scss',
})
export class MonProfil implements OnInit {
  private readonly apiUrl = 'http://localhost:3000/utilisateurs';

  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  adresse = '';

  ancienMotDePasse = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';

  ancienMotDePasseVisible = false;
  nouveauMotDePasseVisible = false;
  confirmationMotDePasseVisible = false;

  chargement = false;
  chargementMotDePasse = false;
  message = '';
  erreur = '';
  messageMotDePasse = '';
  erreurMotDePasse = '';

  constructor(
    private readonly http: HttpClient,
    private readonly session: Session,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerProfil();
  }

  chargerProfil(): void {
    this.chargement = true;

    this.http.get<UtilisateurConnecte>(`${this.apiUrl}/me`)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.chargement = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (utilisateur) => {
          this.nom = utilisateur.nom ?? '';
          this.prenom = utilisateur.prenom ?? '';
          this.email = utilisateur.email ?? '';
          this.telephone = utilisateur.telephone ?? '';
          this.adresse = utilisateur.adresse ?? '';
          this.session.enregistrerUtilisateur(utilisateur);
        },
        error: (error) => {
          this.erreur = this.extraireErreur(error, 'Impossible de charger votre profil.');
        },
      });
  }

  modifierProfil(): void {
    this.message = '';
    this.erreur = '';
    this.chargement = true;

    const donnees = {
      nom: this.nom.trim(),
      prenom: this.prenom.trim(),
      email: this.email.trim(),
      telephone: this.telephone.trim() || null,
      adresse: this.adresse.trim() || null,
    };

    this.http.patch<ReponseProfil>(`${this.apiUrl}/me`, donnees)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.chargement = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (reponse) => {
          localStorage.setItem('vite-gourmand-token', reponse.access_token);
          this.session.enregistrerUtilisateur(reponse.utilisateur);
          this.message = 'Vos informations personnelles ont été mises à jour.';
        },
        error: (error) => {
          this.erreur = this.extraireErreur(error, 'Impossible de modifier votre profil.');
        },
      });
  }

  changerMotDePasse(): void {
    this.messageMotDePasse = '';
    this.erreurMotDePasse = '';

    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      this.erreurMotDePasse = 'Les deux nouveaux mots de passe ne correspondent pas.';
      return;
    }

    this.chargementMotDePasse = true;

    this.http.patch(`${this.apiUrl}/me/mot-de-passe`, {
      ancienMotDePasse: this.ancienMotDePasse,
      nouveauMotDePasse: this.nouveauMotDePasse,
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.chargementMotDePasse = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.ancienMotDePasse = '';
          this.nouveauMotDePasse = '';
          this.confirmationMotDePasse = '';
          this.messageMotDePasse = 'Votre mot de passe a été modifié.';
        },
        error: (error) => {
          this.erreurMotDePasse = this.extraireErreur(
            error,
            'Impossible de modifier votre mot de passe.',
          );
        },
      });
  }

  private extraireErreur(error: any, defaut: string): string {
    if (error.status === 0) return 'Impossible de contacter le serveur.';
    if (error.name === 'TimeoutError') return 'Le serveur ne répond pas dans le délai prévu.';

    const message = error.error?.message;
    return Array.isArray(message) ? message.join(' ') : message ?? defaut;
  }
}
