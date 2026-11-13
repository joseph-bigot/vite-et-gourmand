
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../core/services/session';
import { API_URL } from '../../../core/services/api.config';

interface Menu {
  id_menu: string;
  titre: string;
  prix_par_personne: string;
  nombre_minimum_personnes: number;
  stock: number;
}

interface DonneesCommande {
  id_menu: string;
  date_prestation: string;
  heure_prestation: string;
  adresse_livraison: string;
  lieu_prestation: string;
  nombre_personnes: number;
  distance_km: number;
  livraison_hors_bordeaux: boolean;
}

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './commande.html',
  styleUrl: './commande.scss',
})
export class Commande implements OnInit {
  menu: Menu | null = null;
  erreur = '';
  messageSucces = '';
  chargement = true;
  envoiEnCours = false;
  nombre = 0;

  distanceKm = 0;
  livraisonHorsBordeaux = false;

  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  adresse = '';
  codePostal = '';
  ville = '';
  datePrestation = '';
  heurePrestation = '';
  lieuPrestation = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly session: Session,
  ) {}

  ngOnInit(): void {
    const utilisateur = this.session.utilisateur();

    if (utilisateur) {
      this.nom = utilisateur.nom;
      this.prenom = utilisateur.prenom;
      this.email = utilisateur.email;
      this.telephone = utilisateur.telephone ?? '';
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.erreur = 'Identifiant du menu manquant.';
      this.chargement = false;
      return;
    }

    this.http.get<Menu>(`${API_URL}/menus/${id}`).subscribe({
      next: (menu) => {
        this.menu = menu;
        this.nombre = menu.nombre_minimum_personnes;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur API :', error);
        this.erreur = 'Impossible de charger le menu sélectionné.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  get reductionApplicable(): boolean {
    return (
      !!this.menu &&
      this.nombre >= this.menu.nombre_minimum_personnes + 5
    );
  }

  get prixBrut(): number {
    return this.menu
      ? Number(this.menu.prix_par_personne) * this.nombre
      : 0;
  }

  get montantReduction(): number {
    return this.reductionApplicable
      ? Math.round(this.prixBrut * 10) / 100
      : 0;
  }

  get totalMenu(): number {
    return this.prixBrut - this.montantReduction;
  }

  get fraisLivraison(): number {
    if (!this.livraisonHorsBordeaux) {
      return 5;
    }

    return 5 + Math.max(0, this.distanceKm) * 0.59;
  }

  get totalCommande(): number {
    return this.totalMenu + this.fraisLivraison;
  }

  continuerCommande(): void {
    this.erreur = '';
    this.messageSucces = '';

    if (!this.menu) {
      this.erreur = 'Aucun menu sélectionné.';
      return;
    }

    if (
      !Number.isInteger(this.nombre) ||
      this.nombre < this.menu.nombre_minimum_personnes
    ) {
      this.erreur =
        `Le minimum est de ${this.menu.nombre_minimum_personnes} personnes.`;
      return;
    }

    if (
      !this.nom.trim() ||
      !this.prenom.trim() ||
      !this.email.trim() ||
      !this.telephone.trim() ||
      !this.adresse.trim() ||
      !this.codePostal.trim() ||
      !this.ville.trim() ||
      !this.datePrestation ||
      !this.heurePrestation ||
      !this.lieuPrestation.trim()
    ) {
      this.erreur = 'Merci de remplir tous les champs obligatoires.';
      return;
    }

    if (
      this.livraisonHorsBordeaux &&
      (!Number.isFinite(this.distanceKm) || this.distanceKm < 0)
    ) {
      this.erreur = 'La distance de livraison est invalide.';
      return;
    }

    const donnees: DonneesCommande = {
      id_menu: this.menu.id_menu,
      date_prestation: this.datePrestation,
      heure_prestation: this.heurePrestation,
      adresse_livraison:
        `${this.adresse.trim()}, ${this.codePostal.trim()} ${this.ville.trim()}`,
      lieu_prestation: this.lieuPrestation.trim(),
      nombre_personnes: this.nombre,
      distance_km: this.livraisonHorsBordeaux ? this.distanceKm : 0,
      livraison_hors_bordeaux: this.livraisonHorsBordeaux,
    };

    this.envoiEnCours = true;

    this.http
      .post<{ message: string; commande: { id_commande: string } }>(
        `${API_URL}/commandes`,
        donnees,
      )
      .subscribe({
        next: (reponse) => {
          this.envoiEnCours = false;
          this.messageSucces =
            `Commande n°${reponse.commande.id_commande} créée avec succès.`;
          this.cdr.detectChanges();

          this.router.navigate(['/espace-client']);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la création de la commande :',
            error,
          );
          this.envoiEnCours = false;
          this.erreur =
            error.error?.message ||
            'Impossible de créer la commande. Vérifie les informations et réessaie.';
          this.cdr.detectChanges();
        },
      });
  }
}
