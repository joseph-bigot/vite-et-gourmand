
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/services/api.config';

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


  imageDuPlat(plat: Plat): string {
    const nom = plat.nom
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    const images: Record<string, string> = {
      creme_brulee: 'creme_brulee.png',
      fondant_au_chocolat: 'fondant_chocolat.png',
      salade_de_fruits_frais: 'salade_fruits_frais.png',
      tarte_au_citron_meringuee: 'tarte_citron_meringuee.png',
      tarte_aux_fruits: 'tarte_fruits.png',
      tiramisu_traditionnel: 'tiramisu_traditionnel.png',
      feuillete_aux_champignons: 'feuillete_champignons.png',
      feuillete_aux_legumes: 'feuillete_legumes.png',
      salade_de_chevre_chaud: 'salade_chevre_chaud.png',
      tartare_de_saumon_et_avocat: 'tartare_saumon_avocat.png',
      tomates_et_mozzarella: 'tomates_mozzarella.png',
      veloute_de_potimarron: 'veloute_potimarron.png',
      veloute_de_saison: 'veloute_saison.png',
      boeuf_bourguignon: 'boeuf_bourguignon.png',
      filet_de_saumon_sauce_citron: 'filet_saumon_sauce_citron.png',
      lasagnes_vegetariennes: 'lasagnes_vegetariennes.png',
      magret_de_canard_sauce_miel: 'magret_canard_sauce_miel.png',
      omelette: 'omelette.png',
      risotto_aux_champignons: 'risotto_champignons.png',
      supreme_de_poulet_sauce_forestiere: 'supreme_poulet_sauce_forestiere.png',
      supreme_de_volaille: 'supreme_volaille.png',
    };

    return images[nom]
      ? '/images/' + images[nom]
      : '/images/logo-vite-gourmand.png';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.erreur = 'Identifiant du menu manquant.';
      this.chargement = false;
      return;
    }

    this.http.get<Menu>(`${API_URL}/menus/${id}`).subscribe({
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
