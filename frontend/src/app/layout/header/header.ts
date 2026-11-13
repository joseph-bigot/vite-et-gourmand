import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Session } from '../../core/services/session';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly session = inject(Session);
  private readonly router = inject(Router);

  get destinationEspace(): string {
    const role = this.session.utilisateur()?.role;

    if (role === 'admin') {
      return '/espace-admin';
    }

    if (role === 'employe') {
      return '/espace-employe';
    }

    return '/espace-client';
  }

  get libelleEspace(): string {
    const role = this.session.utilisateur()?.role;

    if (role === 'admin') {
      return 'Administration';
    }

    if (role === 'employe') {
      return 'Mon espace employé';
    }

    return 'Mon espace client';
  }

  deconnexion(): void {
    this.session.deconnecter();
    void this.router.navigate(['/']);
  }
}
