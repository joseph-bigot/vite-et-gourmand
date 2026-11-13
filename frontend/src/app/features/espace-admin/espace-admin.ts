import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, StatistiquesAdmin, EmployeCree } from '../../core/services/admin';
import { MenusGestion, MenuGestion } from '../../core/services/menus-gestion';

@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-admin.html',
  styleUrl: './espace-admin.scss',
})
export class EspaceAdmin implements OnInit {
  ongletActif: 'statistiques' | 'employes' = 'statistiques';

  ouvrirOnglet(onglet: 'statistiques' | 'employes'): void {
    this.ongletActif = onglet;
  }

  private readonly menusService = inject(MenusGestion);



  menusDisponibles: MenuGestion[] = [];
  filtreMenuId = '';
  filtreDateDebut = '';
  filtreDateFin = '';
  erreurFiltres = '';
  statistiques: StatistiquesAdmin | null = null;
  chargement = true;
  erreur = '';

  nom = '';
  prenom = '';
  email = '';
  motDePasse = '';
  motDePasseVisible = false;
  message = '';
  erreurEmploye = '';
  chargementEmploye = false;
  employes: EmployeCree[] = [];
  erreurListeEmployes = '';

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerEmployes();
    this.chargerStatistiques();
    this.menusService.listerTous().subscribe({
      next: (menus) => {
        this.menusDisponibles = menus;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreurFiltres = 'Impossible de charger la liste des menus.';
        this.cdr.detectChanges();
      },
    });
  }



  chargerStatistiques(): void {
    this.chargement = true;
    this.erreur = '';
    this.erreurFiltres = '';

    const filtres: { menuId?: string; dateDebut?: string; dateFin?: string } = {};
    if (this.filtreMenuId) filtres.menuId = this.filtreMenuId;
    if (this.filtreDateDebut) filtres.dateDebut = this.filtreDateDebut;
    if (this.filtreDateFin) filtres.dateFin = this.filtreDateFin;

    this.adminService.obtenirStatistiques(filtres).subscribe({
      next: (statistiques) => {
        this.statistiques = statistiques;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreur = erreur.error?.message
          || 'Impossible de charger les statistiques.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  appliquerFiltresStatistiques(): void {
    if (this.filtreDateDebut && this.filtreDateFin
      && this.filtreDateDebut > this.filtreDateFin) {
      this.erreurFiltres = 'La date de début doit précéder la date de fin.';
      return;
    }
    this.chargerStatistiques();
  }

  reinitialiserFiltresStatistiques(): void {
    this.filtreMenuId = '';
    this.filtreDateDebut = '';
    this.filtreDateFin = '';
    this.chargerStatistiques();
  }

  maximumCommandes(): number {
    return Math.max(
      1,
      ...(this.statistiques?.statistiques_par_menu ?? [])
        .map((menu) => menu.nombreCommandes),
    );
  }

  maximumChiffreAffaires(): number {
    return Math.max(
      1,
      ...(this.statistiques?.statistiques_par_menu ?? [])
        .map((menu) => menu.chiffreAffaires),
    );
  }

  chargerEmployes(): void {
    this.erreurListeEmployes = '';

    this.adminService.obtenirEmployes().subscribe({
      next: (employes) => {
        this.employes = employes;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreurListeEmployes = 'Impossible de charger la liste des employés.';
        this.cdr.detectChanges();
      },
    });
  }

  desactiverEmploye(id: number): void {
    const employe = this.employes.find((item) => item.id_utilisateur === id);

    if (!employe || !employe.actif) {
      return;
    }

    this.adminService.desactiverEmploye(id).subscribe({
      next: () => {
        this.message = 'Le compte employé a été désactivé.';
        this.cdr.detectChanges();
        this.chargerEmployes();
      },
      error: () => {
        this.erreurListeEmployes = 'Impossible de désactiver ce compte employé.';
        this.cdr.detectChanges();
      },
    });
  }

  activerEmploye(id: number): void {
    const employe = this.employes.find((item) => item.id_utilisateur === id);

    if (!employe || employe.actif) {
      return;
    }

    this.adminService.activerEmploye(id).subscribe({
      next: () => {
        this.message = 'Le compte employé a été réactivé.';
        this.cdr.detectChanges();
        this.chargerEmployes();
      },
      error: () => {
        this.erreurListeEmployes = 'Impossible de réactiver ce compte employé.';
        this.cdr.detectChanges();
      },
    });
  }

  supprimerEmploye(id: number): void {
    const employe = this.employes.find((item) => item.id_utilisateur === id);

    if (!employe) {
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer définitivement le compte de ${employe.prenom} ${employe.nom} ? Cette action est irréversible.`,
    );

    if (!confirmation) {
      return;
    }

    this.message = '';
    this.erreurListeEmployes = '';

    this.adminService.supprimerEmploye(id).subscribe({
      next: () => {
        this.employes = this.employes.filter(
          (item) => item.id_utilisateur !== id,
        );
        this.message = 'Le compte employé a été supprimé.';
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurListeEmployes = erreur.error?.message
          ?? 'Impossible de supprimer ce compte employé.';
        this.cdr.detectChanges();
      },
    });
  }

  creerEmploye(): void {
    this.message = '';
    this.erreurEmploye = '';
    this.chargementEmploye = true;

    this.adminService.creerEmploye({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      motDePasse: this.motDePasse,
    }).subscribe({
      next: () => {
        this.message = 'Le compte employé a été créé.';
        this.nom = '';
        this.prenom = '';
        this.email = '';
        this.motDePasse = '';
        this.chargementEmploye = false;
        this.chargerEmployes();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.erreurEmploye = Array.isArray(error.error?.message)
          ? error.error.message.join(' ')
          : error.error?.message ?? 'Impossible de créer le compte employé.';
        this.chargementEmploye = false;
        this.cdr.detectChanges();
      },
    });
  }
}
