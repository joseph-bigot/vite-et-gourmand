import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-reinitialiser-mot-de-passe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reinitialiser-mot-de-passe.html',
  styleUrl: '../connexion/connexion.scss',
})
export class ReinitialiserMotDePasse {
  token = '';
  motDePasse = '';
  motDePasseVisible = false;
  confirmation = '';
  confirmationVisible = false;
  message = '';
  erreur = '';
  chargement = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.erreur = 'Le lien est incomplet. Demandez une nouvelle réinitialisation.';
    }
  }

  reinitialiser(): void {
    this.message = '';
    this.erreur = '';

    if (this.motDePasse !== this.confirmation) {
      this.erreur = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.chargement = true;
    this.http.post<{ message: string }>(
      'http://localhost:3000/utilisateurs/mot-de-passe/reinitialiser',
      { token: this.token, motDePasse: this.motDePasse },
    ).pipe(timeout(10000), finalize(() => {
      this.chargement = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (reponse) => {
        this.message = reponse.message;
        this.motDePasse = '';
        this.confirmation = '';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/connexion']), 1800);
      },
      error: (error) => {
        const detail = error.error?.message;
        this.erreur = error.status === 0
          ? 'Impossible de contacter le serveur.'
          : (typeof detail === 'string'
            ? detail
            : 'Lien invalide ou expiré. Demandez une nouvelle réinitialisation.');
      },
    });
  }
}
