import { FormsModule } from '@angular/forms';

import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Commandes, CommandeClient, HistoriqueStatutCommande } from '../../core/services/commandes';
import { Session } from '../../core/services/session';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  commandeDetailsOuverte: number | null = null;
  historiques: Record<number, HistoriqueStatutCommande[]> = {};
  chargementHistorique: number | null = null;
  erreurHistorique: number | null = null;
  commanderEnModification: number | null = null;
  modification = {
    date_prestation: '',
    heure_prestation: '',
    adresse_livraison: '',
    lieu_prestation: '',
    nombre_personnes: 1,
  };

  ngOnInit(): void {
    this.commandesService.trouverMesCommandes().subscribe({
      next: (commandes) => {
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

  afficherDetails(idCommande: number): void {
    if (this.commandeDetailsOuverte === idCommande) {
      this.commandeDetailsOuverte = null;
      return;
    }

    this.commandeDetailsOuverte = idCommande;

    if (this.historiques[idCommande]) return;

    this.chargementHistorique = idCommande;
    this.erreurHistorique = null;

    this.commandesService.trouverHistoriqueCommande(idCommande).subscribe({
      next: (historique) => {
        this.historiques[idCommande] = historique;
        this.chargementHistorique = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur de chargement de l’historique :', error);
        this.erreurHistorique = idCommande;
        this.chargementHistorique = null;
        this.cdr.detectChanges();
      },
    });
  }

  commencerModification(commande: CommandeClient): void {
    this.commanderEnModification = commande.id_commande;
    this.modification = {
      date_prestation: commande.date_prestation.slice(0, 10),
      heure_prestation: commande.heure_prestation.slice(0, 5),
      adresse_livraison: commande.adresse_livraison,
      lieu_prestation: commande.lieu_prestation,
      nombre_personnes: commande.nombre_personnes,
    };
  }

  enregistrerModification(idCommande: number): void {
    this.commandesService.modifierCommande(
      idCommande,
      this.modification,
    ).subscribe({
      next: () => {
        window.alert('Commande modifiée avec succès.');
        window.location.reload();
      },
      error: (error) => {
        window.alert(
          error.error?.message ?? 'Impossible de modifier la commande.',
        );
      },
    });
  }

  annulerModification(): void {
    this.commanderEnModification = null;
  }

  annulerCommande(idCommande: number): void {
    const motif = window.prompt('Motif de l’annulation :');
    if (!motif?.trim()) return;

    const moyenContact = window.prompt(
      'Moyen de contact (email ou téléphone) :',
    );
    if (!moyenContact?.trim()) return;

    if (!window.confirm('Confirmer l’annulation de cette commande ?')) {
      return;
    }

    this.commandesService
      .annulerCommande(idCommande, motif, moyenContact)
      .subscribe({
        next: () => {
          window.alert('Commande annulée.');
          window.location.reload();
        },
        error: (error) => {
          window.alert(
            error.error?.message ?? 'Impossible d’annuler la commande.',
          );
        },
      });
  }

  deconnecter(): void {
    this.session.deconnecter();
    this.router.navigate(['/']);
  }
}
