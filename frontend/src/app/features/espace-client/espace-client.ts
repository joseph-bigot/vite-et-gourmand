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
import { AvisService } from '../../core/services/avis';

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
  private readonly avisService = inject(AvisService);
  private readonly cdr = inject(ChangeDetectorRef);

  commandes: CommandeClient[] = [];
  chargement = true;
  erreur = '';
  commandeDetailsOuverte: number | null = null;
  historiques: Record<number, HistoriqueStatutCommande[]> = {};
  chargementHistorique: number | null = null;
  avisFormulaires: Record<number, { note: number; commentaire: string }> = {};
  avisEnvoyes: Record<number, boolean> = {};
  avisEnCours: number | null = null;
  erreursAvis: Record<number, string> = {};
  messagesAvis: Record<number, string> = {};
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
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.chargement = true;
    this.erreur = '';

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

    const datePrestation = commande.date_prestation.includes('T')
      ? new Date(commande.date_prestation)
      : null;

    const dateFormatee = datePrestation
      ? [
          datePrestation.getFullYear(),
          String(datePrestation.getMonth() + 1).padStart(2, '0'),
          String(datePrestation.getDate()).padStart(2, '0'),
        ].join('-')
      : commande.date_prestation.slice(0, 10);

    this.modification = {
      date_prestation: dateFormatee,
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
        this.commanderEnModification = null;
        this.chargerCommandes();
        window.alert('Commande modifiée avec succès.');
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
          this.commandeDetailsOuverte = null;
          delete this.historiques[idCommande];
          this.chargerCommandes();
          window.alert('Commande annulée.');
        },
        error: (error) => {
          window.alert(
            error.error?.message ?? 'Impossible d’annuler la commande.',
          );
        },
      });
  }

  formulaireAvis(idCommande: number) {
    if (!this.avisFormulaires[idCommande]) {
      this.avisFormulaires[idCommande] = { note: 5, commentaire: '' };
    }
    return this.avisFormulaires[idCommande];
  }

  envoyerAvis(idCommande: number): void {
    const formulaire = this.formulaireAvis(idCommande);
    const commentaire = formulaire.commentaire.trim();
    this.erreursAvis[idCommande] = '';

    if (!Number.isInteger(formulaire.note) ||
        formulaire.note < 1 || formulaire.note > 5) {
      this.erreursAvis[idCommande] = 'Choisissez une note entre 1 et 5.';
      return;
    }

    if (commentaire.length < 3 || commentaire.length > 2000) {
      this.erreursAvis[idCommande] =
        'Le commentaire doit contenir entre 3 et 2 000 caractères.';
      return;
    }

    this.avisEnCours = idCommande;
    this.avisService.creerAvis({
      id_commande: String(idCommande),
      note: formulaire.note,
      commentaire,
    }).subscribe({
      next: (reponse) => {
        this.avisEnvoyes[idCommande] = true;
        this.messagesAvis[idCommande] =
          reponse.message || 'Avis transmis pour modération.';
        this.avisEnCours = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.erreursAvis[idCommande] =
          Array.isArray(error.error?.message)
            ? error.error.message.join(' ')
            : error.error?.message || 'Impossible de transmettre votre avis.';
        this.avisEnCours = null;
        this.cdr.detectChanges();
      },
    });
  }

  deconnecter(): void {
    this.session.deconnecter();
    this.router.navigate(['/']);
  }
}
