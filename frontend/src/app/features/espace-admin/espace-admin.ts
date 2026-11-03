import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, StatistiquesAdmin, EmployeCree } from '../../core/services/admin';
import { AvisAModerer, AvisService } from '../../core/services/avis';
import { MenusGestion, MenuGestion } from '../../core/services/menus-gestion';
import { HorairesService, type Horaire } from '../../core/services/horaires';

@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-admin.html',
  styleUrl: './espace-admin.scss',
})
export class EspaceAdmin implements OnInit {
  private readonly avisService = inject(AvisService);
  private readonly menusService = inject(MenusGestion);
  private readonly horairesService = inject(HorairesService);

  readonly joursSemaine = [
    { numero: 1, nom: 'Lundi' },
    { numero: 2, nom: 'Mardi' },
    { numero: 3, nom: 'Mercredi' },
    { numero: 4, nom: 'Jeudi' },
    { numero: 5, nom: 'Vendredi' },
    { numero: 6, nom: 'Samedi' },
    { numero: 7, nom: 'Dimanche' },
  ];

  horaires: Horaire[] = [];
  chargementHoraires = false;
  enregistrementHoraires = false;
  erreurHoraires = '';
  messageHoraires = '';
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
  message = '';
  erreurEmploye = '';
  chargementEmploye = false;
  employes: EmployeCree[] = [];
  erreurListeEmployes = '';
  avis: AvisAModerer[] = [];
  chargementAvis = false;
  erreurAvis = '';
  messageAvis = '';
  avisEnCours: string | null = null;

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerAvis();
    this.chargerHoraires();
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



  chargerHoraires(): void {
    this.chargementHoraires = true;
    this.erreurHoraires = '';
    this.messageHoraires = '';

    this.horairesService.lister().subscribe({
      next: (horaires) => {
        this.horaires = this.joursSemaine.map((jour) => {
          const horaire = horaires.find((h) => h.jour_semaine === jour.numero);
          return horaire ?? {
            jour_semaine: jour.numero,
            heure_ouverture: '09:00',
            heure_fermeture: '18:00',
            ferme: false,
          };
        });
        this.chargementHoraires = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurHoraires =
          erreur.error?.message || 'Impossible de charger les horaires.';
        this.chargementHoraires = false;
        this.cdr.detectChanges();
      },
    });
  }

  enregistrerHoraires(): void {
    if (this.enregistrementHoraires) return;

    this.enregistrementHoraires = true;
    this.erreurHoraires = '';
    this.messageHoraires = '';

    this.horairesService.modifier(this.horaires).subscribe({
      next: (reponse) => {
        this.messageHoraires = reponse?.message || 'Les horaires ont été enregistrés.';
        this.enregistrementHoraires = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurHoraires =
          erreur?.error?.message || 'Impossible d’enregistrer les horaires.';
        this.enregistrementHoraires = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.enregistrementHoraires = false;
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

  chargerAvis(): void {
    this.chargementAvis = true;
    this.erreurAvis = '';

    this.avisService.trouverAvisAModerer().subscribe({
      next: (avis) => {
        this.avis = avis;
        this.chargementAvis = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurAvis = erreur.error?.message || 'Impossible de charger les avis à modérer.';
        this.chargementAvis = false;
        this.cdr.detectChanges();
      },
    });
  }

  modererAvis(avis: AvisAModerer, statut: 'approuve' | 'rejete'): void {
    if (this.avisEnCours) return;

    const decision = statut === 'approuve' ? 'approuver' : 'rejeter';
    if (!confirm(`Confirmer la décision : ${decision} cet avis ?`)) return;

    this.avisEnCours = avis.id_avis;
    this.erreurAvis = '';
    this.messageAvis = '';

    this.avisService.modererAvis(avis.id_avis, statut).subscribe({
      next: (reponse) => {
        this.messageAvis = reponse.message;
        this.avisEnCours = null;
        this.chargerAvis();
      },
      error: (erreur) => {
        this.erreurAvis = erreur.error?.message || 'Impossible de modérer cet avis.';
        this.avisEnCours = null;
        this.cdr.detectChanges();
      },
    });
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
