import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  commandes: CommandeEmploye[] = [];
  recherche = '';
  filtreStatut = 'tous';
  ordreDate: 'croissant' | 'decroissant' = 'croissant';

  readonly libellesStatuts: Record<string, string> = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    en_preparation: 'En préparation',
    en_livraison: 'En livraison',
    livree: 'Livrée',
    attente_retour_materiel: 'En attente du retour du matériel',
    terminee: 'Terminée',
    annulee: 'Annulée',
  };

  classeStatut(statut: string): string {
    const classes: Record<string, string> = {
      en_attente: 'statut-attente',
      acceptee: 'statut-acceptee',
      refusee: 'statut-terminale',
      en_preparation: 'statut-preparation',
      en_livraison: 'statut-livraison',
      livree: 'statut-livree',
      attente_retour_materiel: 'statut-attente',
      terminee: 'statut-terminale',
      annulee: 'statut-terminale',
    };
    return classes[statut] || 'statut-neutre';
  }

  estPrestationProche(commande: CommandeEmploye): boolean {
    if (['annulee', 'refusee', 'terminee'].includes(commande.statut)) {
      return false;
    }

    const datePrestation = new Date(`${commande.date_prestation}T${commande.heure_prestation || '00:00'}:00`);
    if (Number.isNaN(datePrestation.getTime())) return false;

    const maintenant = new Date();
    const ecart = datePrestation.getTime() - maintenant.getTime();
    return ecart >= 0 && ecart <= 48 * 60 * 60 * 1000;
  }

  get commandesFiltrees(): CommandeEmploye[] {
    const recherche = this.recherche.trim().toLocaleLowerCase('fr');

    return this.commandes
      .filter((commande) => {
        const nomComplet = `${commande.prenom_client} ${commande.nom_client}`.toLocaleLowerCase('fr');
        const nomInverse = `${commande.nom_client} ${commande.prenom_client}`.toLocaleLowerCase('fr');
        const correspondRecherche =
          !recherche ||
          String(commande.id_commande).includes(recherche) ||
          nomComplet.includes(recherche) ||
          nomInverse.includes(recherche);

        return correspondRecherche &&
          (this.filtreStatut === 'tous' || commande.statut === this.filtreStatut);
      })
      .sort((a, b) => {
        const dateA = `${a.date_prestation}T${a.heure_prestation || '00:00'}`;
        const dateB = `${b.date_prestation}T${b.heure_prestation || '00:00'}`;
        const comparaison = dateA.localeCompare(dateB);
        return this.ordreDate === 'croissant' ? comparaison : -comparaison;
      });
  }

  get nombreCommandesParStatut(): Record<string, number> {
    return this.commandes.reduce((compteurs, commande) => {
      compteurs[commande.statut] = (compteurs[commande.statut] || 0) + 1;
      return compteurs;
    }, {} as Record<string, number>);
  }
  chargement = true;
  erreur = '';
  message = '';
  commandeEnCours: number | null = null;
  statutSelectionne: Record<number, string> = {};
  motifAnnulation: Record<number, string> = {};
  moyenContact: Record<number, string> = {};

  readonly transitionsAutorisees: Record<string, string[]> = {
    en_attente: ['acceptee', 'refusee'],
    acceptee: ['en_preparation'],
    en_preparation: ['en_livraison'],
    en_livraison: ['livree'],
    livree: ['attente_retour_materiel'],
    attente_retour_materiel: ['terminee'],
  };

  peutGererCommande(commande: CommandeEmploye): boolean {
    return !!this.transitionsAutorisees[commande.statut]?.length;
  }

  statutsPourCommande(commande: CommandeEmploye) {
    return this.statutsPossibles.filter((statut) =>
      this.transitionsAutorisees[commande.statut]?.includes(statut.valeur)
    );
  }

  readonly statutsPossibles = [
    { valeur: 'acceptee', libelle: 'Acceptée' },
    { valeur: 'refusee', libelle: 'Refusée' },
    { valeur: 'en_preparation', libelle: 'En préparation' },
    { valeur: 'en_livraison', libelle: 'En livraison' },
    { valeur: 'livree', libelle: 'Livrée' },
    { valeur: 'attente_retour_materiel', libelle: 'En attente du retour du matériel' },
    { valeur: 'terminee', libelle: 'Terminée' },
  ];

  suivreCommande(index: number, commande: CommandeEmploye): number {
    return commande.id_commande;
  }

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.chargement = true;
    this.erreur = '';

    this.commandesService.trouverToutesLesCommandes().subscribe({
      next: (commandes) => {
        console.log('[EspaceEmploye] Commandes reçues :', commandes.length);
        this.commandes = commandes;
        this.chargement = false;
        this.cdr.detectChanges();
        console.log('[EspaceEmploye] chargement =', this.chargement);
      },
      error: (erreur) => {
        console.error('[EspaceEmploye] Erreur API :', erreur);
        this.erreur = 'Impossible de charger les commandes. Vérifiez votre connexion et vos droits.';
        this.chargement = false;
        this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
