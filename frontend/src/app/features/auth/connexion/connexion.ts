
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { Session, UtilisateurConnecte } from '../../../core/services/session';

interface ReponseConnexion {
  utilisateur: UtilisateurConnecte;
  access_token: string;
}

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.scss',
})
export class Connexion {
  email = '';
  motDePasse = '';

  message = '';
  erreur = '';
  chargement = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly session: Session,
  ) {}

  connecter(): void {
    this.message = '';
    this.erreur = '';
    this.chargement = true;

    this.http
      .post<ReponseConnexion>(
        'http://localhost:3000/utilisateurs/connexion',
        {
          email: this.email,
          motDePasse: this.motDePasse,
        },
      )
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
          this.message = `Bienvenue ${reponse.utilisateur.prenom}.`;
this.motDePasse = '';
this.cdr.detectChanges();

const destination =
  reponse.utilisateur.role === 'admin'
    ? '/espace-admin'
    : reponse.utilisateur.role === 'employe'
      ? '/espace-employe'
      : '/espace-client';

this.router.navigate([destination]);
        },
        error: (error) => {
          if (error.status === 0) {
            this.erreur = 'Impossible de contacter le serveur.';
          } else if (error.name === 'TimeoutError') {
            this.erreur = 'Le serveur ne répond pas dans le délai prévu.';
          } else {
            const messageErreur = error.error?.message;
            this.erreur = Array.isArray(messageErreur)
              ? messageErreur.join(' ')
              : messageErreur ??
                'Adresse e-mail ou mot de passe incorrect.';
          }

          this.cdr.detectChanges();
        },
      });
  }
}
