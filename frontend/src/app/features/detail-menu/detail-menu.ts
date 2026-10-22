
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Plat {
  id_plat: string;
  nom: string;
  description: string | null;
  categorie: 'entree' | 'plat' | 'dessert';
  quantite: number;
  ordre_affichage: number;
  allergenes: string[];
}

interface Menu {
  id_menu: string;
  titre: string;
  description: string;
  prix_par_personne: string;
  nombre_minimum_personnes: number;
  stock: number;
  theme: string;
  regime_alimentaire: string;
  conditions_commande: string;
  conditions_conservation: string;
  plats: Plat[];
}

@Component({
  selector: 'app-detail-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-menu.html',
  styleUrl: './detail-menu.scss',
})
export class DetailMenu implements OnInit {
  menu: Menu | null = null;
  erreur = '';
  chargement = true;

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
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur API :', error);
        this.erreur = 'Impossible de charger ce menu.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }
}
