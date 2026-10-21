
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';

interface Menu {
  id_menu: string;
  titre: string;
  description: string;
  prix_par_personne: string;
  nombre_minimum_personnes: number;
  stock: number;
  theme: string;
  regime_alimentaire: string;
}

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menus.html',
  styleUrl: './menus.scss',
})
export class Menus implements OnInit {
  menus: Menu[] = [];
  erreur = '';
  chargement = true;

  theme = '';
  regime = '';
  prixMin = '';
  prixMax = '';
  nombrePersonnes = '';

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerMenus();
  }

  chargerMenus(): void {
    this.chargement = true;
    this.erreur = '';

    let params = new HttpParams();

    if (this.theme) {
      params = params.set('theme', this.theme);
    }

    if (this.regime) {
      params = params.set('regime', this.regime);
    }

    if (this.prixMin.trim() !== '') {
      const prix = Number(this.prixMin);
      if (Number.isFinite(prix) && prix >= 0) {
        params = params.set('prixMin', prix);
      }
    }

    if (this.prixMax.trim() !== '') {
      const prix = Number(this.prixMax);
      if (Number.isFinite(prix) && prix >= 0) {
        params = params.set('prixMax', prix);
      }
    }

    if (this.nombrePersonnes.trim() !== '') {
      const nombre = Number(this.nombrePersonnes);
      if (Number.isFinite(nombre) && nombre >= 1) {
        params = params.set('nombrePersonnes', nombre);
      }
    }

    this.http.get<Menu[]>('http://localhost:3000/menus', { params }).subscribe({
      next: (menus) => {
        this.menus = menus;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur API :', error);
        this.erreur = 'Impossible de charger les menus. Réessayez plus tard.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  changerTheme(event: Event): void {
    this.theme = (event.target as HTMLSelectElement).value;
    this.chargerMenus();
  }

  changerRegime(event: Event): void {
    this.regime = (event.target as HTMLSelectElement).value;
    this.chargerMenus();
  }

  changerPrixMin(event: Event): void {
    this.prixMin = (event.target as HTMLInputElement).value;
    this.chargerMenus();
  }

  changerPrixMax(event: Event): void {
    this.prixMax = (event.target as HTMLInputElement).value;
    this.chargerMenus();
  }

  changerNombrePersonnes(event: Event): void {
    this.nombrePersonnes = (event.target as HTMLInputElement).value;
    this.chargerMenus();
  }

  reinitialiserFiltres(): void {
    this.theme = '';
    this.regime = '';
    this.prixMin = '';
    this.prixMax = '';
    this.nombrePersonnes = '';
    this.chargerMenus();
  }
}
