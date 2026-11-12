import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Session } from '../../core/services/session';
import { API_URL } from '../../core/services/api.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  nom = '';
  prenom = '';
  civilite = '';
  email = '';
  description = '';
  erreur = '';
  messageSucces = '';
  envoiEnCours = false;

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly session: Session,
  ) {
    const utilisateur = this.session.utilisateur();
    if (utilisateur) {
      this.nom = utilisateur.nom;
      this.prenom = utilisateur.prenom;
    }
  }

  envoyer(): void {
    if (this.envoiEnCours) return;

    this.erreur = '';
    this.messageSucces = '';
    this.envoiEnCours = true;

    this.http
      .post<{ message: string }>(`${API_URL}/contact`, {
        nom: this.nom.trim(),
        prenom: this.prenom.trim(),
        civilite: this.civilite,
        email: this.email.trim(),
        description: this.description.trim(),
      })
      .pipe(
        finalize(() => {
          this.envoiEnCours = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (reponse) => {
          this.messageSucces =
            reponse?.message || 'Votre message a bien été envoyé.';
          this.nom = '';
          this.prenom = '';
          this.civilite = '';
          this.email = '';
          this.description = '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.erreur = Array.isArray(error?.error?.message)
            ? error.error.message.join(', ')
            : error?.error?.message ||
              'Impossible d’envoyer votre message. Veuillez réessayer plus tard.';
          this.cdr.detectChanges();
        },
      });
  }
}
