import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, StatistiquesAdmin, EmployeCree } from '../../core/services/admin';

@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-admin.html',
  styleUrl: './espace-admin.scss',
})
export class EspaceAdmin implements OnInit {
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

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerEmployes();
    this.adminService.obtenirStatistiques().subscribe({
      next: (statistiques) => {
        this.statistiques = statistiques;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Impossible de charger les statistiques.';
        this.chargement = false;
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
        this.chargerEmployes();
      },
      error: () => {
        this.erreurListeEmployes = 'Impossible de désactiver ce compte employé.';
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
