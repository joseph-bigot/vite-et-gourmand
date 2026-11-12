import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { API_URL } from '../../../core/services/api.config';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrl: '../connexion/connexion.scss',
})
export class MotDePasseOublie {
  email = '';
  message = '';
  erreur = '';
  chargement = false;

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  envoyer(): void {
    this.message = '';
    this.erreur = '';
    this.chargement = true;
    this.http.post<{ message: string }>(
      `${API_URL}/utilisateurs/mot-de-passe/oublie`,
      { email: this.email },
    ).pipe(timeout(10000), finalize(() => {
      this.chargement = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (reponse) => {
        this.message = reponse.message;
        this.email = '';
      },
      error: (error) => {
        this.erreur = error.status === 0
          ? 'Impossible de contacter le serveur.'
          : 'La demande n’a pas pu être traitée. Réessayez ultérieurement.';
      },
    });
  }
}
