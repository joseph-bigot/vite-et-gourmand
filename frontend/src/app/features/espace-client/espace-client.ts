
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Session } from '../../core/services/session';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './espace-client.html',
  styleUrl: './espace-client.scss',
})
export class EspaceClient {
  readonly session = inject(Session);
  private readonly router = inject(Router);

  deconnecter(): void {
    this.session.deconnecter();
    this.router.navigate(['/']);
  }
}
