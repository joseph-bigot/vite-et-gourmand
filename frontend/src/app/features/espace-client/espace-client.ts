import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Commandes,
  CommandeClient,
} from '../../core/services/commandes';
import { Session } from '../../core/services/session';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './espace-client.html',
  styleUrl: './espace-client.scss',
})
export class EspaceClient implements OnInit {
  readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly commandesService = inject(Commandes);
  private readonly cdr = inject(ChangeDetectorRef);

  commandes: CommandeClient[] = [];
  chargement = true;
  erreur = '';

  ngOnInit(): void {
    console.log('Chargement des commandes démarré');

    this.commandesService.trouverMesCommandes().subscribe({
      next: (commandes) => {
        console.log('Type reçu :', typeof commandes);
console.log('Données reçues :', commandes);
        this.commandes = commandes;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur de chargement des commandes :', error);
        this.erreur = 'Impossible de charger vos commandes.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  deconnecter(): void {
    this.session.deconnecter();
    this.router.navigate(['/']);
  }
}