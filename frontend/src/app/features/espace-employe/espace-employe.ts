import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Commandes, CommandeEmploye } from '../../core/services/commandes';

@Component({
  selector: 'app-espace-employe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-employe.html',
  styleUrl: './espace-employe.scss',
})
export class EspaceEmploye implements OnInit {
  private readonly commandesService = inject(Commandes);

  commandes: CommandeEmploye[] = [];
  chargement = true;
  erreur = '';
  message = '';
  commandeEnCours: number | null = null;
  statutSelectionne: Record<number, string> = {};
  motifAnnulation: Record<number, string> = {};
  moyenContact: Record<number, string> = {};

  readonly statutsPossibles = [
    { valeur: 'acceptee', libelle: 'Acceptée' },
    { valeur: 'refusee', libelle: 'Refusée' },
    { valeur: 'en_preparation', libelle: 'En préparation' },
    { valeur: 'en_livraison', libelle: 'En livraison' },
    { valeur: 'livree', libelle: 'Livrée' },
    { valeur: 'attente_retour_materiel', libelle: 'En attente du retour du matériel' },
    { valeur: 'terminee', libelle: 'Terminée' },
  ];

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.chargement = true;
    this.erreur = '';

    this.commandesService.trouverToutesLesCommandes().subscribe({
      next: (commandes) => {
        this.commandes = commandes;
        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger les commandes. Vérifiez votre connexion et vos droits.';
        this.chargement = false;
      },
    });
  }

  changerStatut(commande: CommandeEmploye): void {
    const statut = this.statutSelectionne[commande.id_commande];

    if (!statut) {
      this.erreur = 'Sélectionnez un statut.';
      return;
    }

    const motif = this.motifAnnulation[commande.id_commande]?.trim();
    const moyenContact = this.moyenContact[commande.id_commande]?.trim();

    if (statut === 'refusee' && (!motif || !moyenContact)) {
      this.erreur = 'Pour refuser une commande, indiquez le motif et le moyen de contact.';
      return;
    }

    this.commandeEnCours = commande.id_commande;
    this.erreur = '';
    this.message = '';

    this.commandesService
      .changerStatutCommande(commande.id_commande, statut, motif, moyenContact)
      .subscribe({
        next: (reponse) => {
          this.message = reponse.message || 'Statut mis à jour.';
          this.commandeEnCours = null;
          this.chargerCommandes();
        },
        error: (erreur) => {
          this.erreur = erreur.error?.message || 'Impossible de modifier le statut de cette commande.';
          this.commandeEnCours = null;
        },
      });
  }

  annulerCommande(commande: CommandeEmploye): void {
    const id = commande.id_commande;
    const motif = this.motifAnnulation[id]?.trim();
    const moyenContact = this.moyenContact[id]?.trim();

    if (!motif || !moyenContact) {
      this.erreur = 'Pour annuler une commande, indiquez le motif et le moyen de contact.';
      return;
    }

    if (!confirm(`Confirmer l’annulation de la commande n°${id} ?`)) {
      return;
    }

    this.commandeEnCours = id;
    this.erreur = '';
    this.message = '';

    this.commandesService.annulerCommandeParEmploye(id, motif, moyenContact).subscribe({
      next: (reponse) => {
        this.message = reponse.message || 'Commande annulée.';
        this.commandeEnCours = null;
        this.chargerCommandes();
      },
      error: (erreur) => {
        this.erreur = erreur.error?.message || 'Impossible d’annuler cette commande.';
        this.commandeEnCours = null;
      },
    });
  }
}
