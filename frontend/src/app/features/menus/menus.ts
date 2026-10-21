import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('Chargement des menus');

    this.http.get<Menu[]>('http://localhost:3000/menus').subscribe({
      next: (menus) => {
        console.log('Menus reçus :', menus);
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
}