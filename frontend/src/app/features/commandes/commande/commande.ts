
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Menu {
  id_menu: string;
  titre: string;
  prix_par_personne: string;
  nombre_minimum_personnes: number;
  stock: number;
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
  chargement = true;
  nombre = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.erreur = 'Identifiant du menu manquant.';
      this.chargement = false;
      return;
    }

    this.http.get<Menu>(`http://localhost:3000/menus/${id}`).subscribe({
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
    return this.reductionApplicable ? this.prixBrut * 0.1 : 0;
  }

  get totalMenu(): number {
    return this.prixBrut - this.montantReduction;
  }

  continuerCommande(): void {
    if (
      !this.menu ||
      this.nombre < this.menu.nombre_minimum_personnes
    ) {
      return;
    }

    alert(
      'Étape suivante : les coordonnées et les informations de livraison.',
    );
  }
}
