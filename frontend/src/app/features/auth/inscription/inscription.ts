import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  motDePasse = '';

  message = '';
  erreur = '';
  chargement = false;

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  inscrire(): void {
    this.message = '';
    this.erreur = '';
    this.chargement = true;

    this.http
      .post('http://localhost:3000/utilisateurs/inscription', {
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        telephone: this.telephone,
        motDePasse: this.motDePasse,
      })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.chargement = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (reponse) => {

          this.message =
            'Votre compte a été créé. Vous pouvez vous connecter.';

          this.nom = '';
          this.prenom = '';
          this.email = '';
          this.telephone = '';
          this.motDePasse = '';

          this.cdr.detectChanges();
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
                'Impossible de créer le compte. Vérifiez les informations saisies.';
          }

          this.cdr.detectChanges();
        },
      });
  }
}