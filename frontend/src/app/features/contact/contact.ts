import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  civilite = '';
  email = '';
  description = '';
  erreur = '';
  messageSucces = '';
  envoiEnCours = false;

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  envoyer(): void {
    if (this.envoiEnCours) return;

    this.erreur = '';
    this.messageSucces = '';
    this.envoiEnCours = true;

    this.http
      .post<{ message: string }>('http://localhost:3000/contact', {
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
