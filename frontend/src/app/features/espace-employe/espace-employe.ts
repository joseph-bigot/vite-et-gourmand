import { finalize, forkJoin } from 'rxjs';
import { AvisAModerer, AvisService } from '../../core/services/avis';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Commandes, CommandeEmploye } from '../../core/services/commandes';
import { HorairesService, type Horaire } from '../../core/services/horaires';
import {
  MenusGestion,
  MenuGestion,
  PlatGestion,
  ReferencesMenus,
  DonneesMenu,
} from '../../core/services/menus-gestion';

@Component({
  selector: 'app-espace-employe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-employe.html',
  styleUrl: './espace-employe.scss',
})
export class EspaceEmploye implements OnInit {
  private readonly avisService = inject(AvisService);

  private readonly commandesService = inject(Commandes);
  private readonly cdr = inject(ChangeDetectorRef);
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

  ongletActif: 'commandes' | 'menus' | 'plats' | 'avis' | 'horaires' = 'commandes';
  avis: AvisAModerer[] = [];
  chargementAvis = false;
  erreurAvis = '';
  messageAvis = '';
  avisEnCours: string | null = null;
  menus: MenuGestion[] = [];
  plats: PlatGestion[] = [];

  readonly categoriesPlats: {
    valeur: 'entree' | 'plat' | 'dessert';
    libelle: string;
  }[] = [
    { valeur: 'entree', libelle: 'Entrées' },
    { valeur: 'plat', libelle: 'Plats' },
    { valeur: 'dessert', libelle: 'Desserts' },
  ];

  platsParCategorie(categorie: 'entree' | 'plat' | 'dessert'): PlatGestion[] {
    return this.plats.filter((plat) => plat.categorie === categorie);
  }

  nomsAllergenes(plat: PlatGestion): string {
    const noms = (plat.allergenes ?? [])
      .map((id) =>
        this.referencesMenus.allergenes.find(
          (allergene) => Number(allergene.id_allergene) === Number(id),
        )?.nom,
      )
      .filter((nom): nom is string => Boolean(nom));

    return noms.length ? noms.join(', ') : 'Aucun renseigné';
  }
  referencesMenus: ReferencesMenus = { themes: [], regimes: [], allergenes: [] };
  chargementMenus = false;
  erreurMenus = '';
  messageMenus = '';
  enregistrementMenu = false;
  menuEnEdition: number | null = null;
  formulaireMenuVisible = false;

  formulaireMenu: DonneesMenu = this.nouveauFormulaireMenu();
  nouveauPlat = {
    nom: '',
    description: '',
    categorie: 'plat' as 'entree' | 'plat' | 'dessert',
    allergenes: [] as number[],
  };
  platEnEdition: number | null = null;
  enregistrementModificationPlat = false;

  formulairePlatEdition = {
    nom: '',
    description: '',
    categorie: 'plat' as 'entree' | 'plat' | 'dessert',
    allergenes: [] as number[],
  };

  creationPlatDansMenuVisible = false;
  enregistrementPlatMenu = false;


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

    const datePrestation = new Date(
      `${commande.date_prestation}T${commande.heure_prestation || '00:00'}:00`,
    );
    if (Number.isNaN(datePrestation.getTime())) return false;

    const maintenant = new Date();
    const ecart = datePrestation.getTime() - maintenant.getTime();
    return ecart >= 0 && ecart <= 48 * 60 * 60 * 1000;
  }

  get commandesFiltrees(): CommandeEmploye[] {
    const recherche = this.recherche.trim().toLocaleLowerCase('fr');

    return this.commandes
      .filter((commande) => {
        const nomComplet = `${commande.prenom_client} ${commande.nom_client}`.toLocaleLowerCase(
          'fr',
        );
        const nomInverse = `${commande.nom_client} ${commande.prenom_client}`.toLocaleLowerCase(
          'fr',
        );
        const correspondRecherche =
          !recherche ||
          String(commande.id_commande).includes(recherche) ||
          nomComplet.includes(recherche) ||
          nomInverse.includes(recherche);

        return (
          correspondRecherche &&
          (this.filtreStatut === 'tous' || commande.statut === this.filtreStatut)
        );
      })
      .sort((a, b) => {
        const dateA = `${a.date_prestation}T${a.heure_prestation || '00:00'}`;
        const dateB = `${b.date_prestation}T${b.heure_prestation || '00:00'}`;
        const comparaison = dateA.localeCompare(dateB);
        return this.ordreDate === 'croissant' ? comparaison : -comparaison;
      });
  }

  get nombreCommandesParStatut(): Record<string, number> {
    return this.commandes.reduce(
      (compteurs, commande) => {
        compteurs[commande.statut] = (compteurs[commande.statut] || 0) + 1;
        return compteurs;
      },
      {} as Record<string, number>,
    );
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
    livree: ['attente_retour_materiel', 'terminee'],
    attente_retour_materiel: ['terminee'],
  };

  peutGererCommande(commande: CommandeEmploye): boolean {
    return !!this.transitionsAutorisees[commande.statut]?.length;
  }

  statutsPourCommande(commande: CommandeEmploye) {
    return this.statutsPossibles.filter((statut) =>
      this.transitionsAutorisees[commande.statut]?.includes(statut.valeur),
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

  private nouveauFormulaireMenu(): DonneesMenu {
    return {
      id_theme: 0,
      id_regime: 0,
      titre: '',
      description: '',
      prix_par_personne: 0,
      nombre_minimum_personnes: 1,
      stock: 0,
      conditions_commande: '',
      conditions_conservation: '',
      disponible: true,
      plats: [],
    };
  }

  ouvrirOnglet(onglet: 'commandes' | 'menus' | 'plats' | 'avis' | 'horaires'): void {
    this.ongletActif = onglet;
    if (onglet === 'avis') this.chargerAvis();
    this.erreurMenus = '';
    this.messageMenus = '';
    if (onglet === 'menus') this.chargerGestionMenus();
    if (onglet === 'plats') this.chargerPlats();
    if (onglet === 'horaires') this.chargerHoraires();
  }

  chargerGestionMenus(): void {
    this.chargementMenus = true;
    this.erreurMenus = '';

    forkJoin({
      references: this.menusService.listerReferences(),
      plats: this.menusService.listerPlats(),
      menus: this.menusService.listerTous(),
    }).subscribe({
      next: ({ references, plats, menus }) => {
        this.referencesMenus = references;
        this.plats = plats;
        this.menus = menus;
        this.chargementMenus = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('[EspaceEmploye] Erreur chargement catalogue :', e);
        this.erreurMenus = e.error?.message || 'Impossible de charger le catalogue.';
        this.chargementMenus = false;
        this.cdr.detectChanges();
      },
    });
  }

  chargerPlats(): void {
    this.chargementMenus = true;
    this.erreurMenus = '';

    forkJoin({
      references: this.menusService.listerReferences(),
      plats: this.menusService.listerPlats(),
    })
      .pipe(
        finalize(() => {
          this.chargementMenus = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ references, plats }) => {
          this.referencesMenus = references;
          this.plats = plats;
        },
        error: (e) => {
          console.error('[EspaceEmploye] Erreur chargement des plats :', e);
          this.erreurMenus =
            e.error?.message || 'Impossible de charger les plats.';
        },
      });
  }
  editerMenu(menu: MenuGestion): void {
    this.menuEnEdition = menu.id_menu;
    this.formulaireMenuVisible = true;
    this.formulaireMenu = {
      id_theme: Number(menu.id_theme),
      id_regime: Number(menu.id_regime),
      titre: menu.titre,
      description: menu.description,
      prix_par_personne: Number(menu.prix_par_personne),
      nombre_minimum_personnes: Number(menu.nombre_minimum_personnes),
      stock: Number(menu.stock),
      conditions_commande: menu.conditions_commande,
      conditions_conservation: menu.conditions_conservation,
      disponible: menu.disponible,
      plats: (menu.plats ?? []).map((plat) => ({
        id_plat: Number(plat.id_plat),
        quantite: Number(plat.quantite),
        ordre_affichage: Number(plat.ordre_affichage),
      })),
    };
  }

  nouveauMenu(): void {
    this.menuEnEdition = null;
    this.formulaireMenu = this.nouveauFormulaireMenu();
    this.formulaireMenuVisible = true;
    this.erreurMenus = '';
    this.messageMenus = '';
  }

  fermerFormulaireMenu(): void {
    this.formulaireMenuVisible = false;
    this.menuEnEdition = null;
    this.formulaireMenu = this.nouveauFormulaireMenu();
  }

  ajouterPlatAuMenu(idPlat: string): void {
    const id = Number(idPlat);
    if (!id || this.formulaireMenu.plats.some((p) => p.id_plat === id)) return;
    this.formulaireMenu.plats.push({
      id_plat: id,
      quantite: 1,
      ordre_affichage: this.formulaireMenu.plats.length + 1,
    });
  }

  modifierAllergeneNouveauPlat(id: number, coche: boolean): void {
    if (coche && !this.nouveauPlat.allergenes.includes(id)) {
      this.nouveauPlat.allergenes.push(id);
    } else if (!coche) {
      this.nouveauPlat.allergenes = this.nouveauPlat.allergenes.filter(
        (allergeneId) => allergeneId !== id
      );
    }
  }

  creerPlatDepuisMenu(): void {
    if (this.nouveauPlat.nom.trim().length < 2) {
      this.erreurMenus = 'Le nom du plat doit contenir au moins deux caractères.';
      return;
    }

    const donnees = {
      ...this.nouveauPlat,
      nom: this.nouveauPlat.nom.trim(),
      allergenes: [...this.nouveauPlat.allergenes],
    };

    this.enregistrementPlatMenu = true;
    this.erreurMenus = '';

    this.menusService.creerPlat(donnees).subscribe({
      next: (reponse) => {
        const platCree: PlatGestion = {
          id_plat: reponse.id_plat,
          nom: donnees.nom,
          description: donnees.description,
          categorie: donnees.categorie,
          allergenes: donnees.allergenes,
        };

        this.plats = [...this.plats, platCree];
        this.ajouterPlatAuMenu(String(platCree.id_plat));
        this.nouveauPlat = {
          nom: '',
          description: '',
          categorie: 'plat',
          allergenes: [],
        };
        this.creationPlatDansMenuVisible = false;
        this.enregistrementPlatMenu = false;
        this.messageMenus = 'Plat créé et ajouté au menu.';
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible de créer le plat.';
        this.enregistrementPlatMenu = false;
      },
    });
  }

  retirerPlatDuMenu(idPlat: number): void {
    this.formulaireMenu.plats = this.formulaireMenu.plats
      .filter((p) => p.id_plat !== idPlat)
      .map((p, index) => ({ ...p, ordre_affichage: index + 1 }));
  }

  nomPlat(idPlat: number): string {
    return this.plats.find((p) => Number(p.id_plat) === Number(idPlat))?.nom || `Plat ${idPlat}`;
  }

  enregistrerMenu(): void {
    if (!this.formulaireMenu.titre.trim() || !this.formulaireMenu.description.trim()) {
      this.erreurMenus = 'Le titre et la description sont obligatoires.';
      return;
    }
    if (!this.formulaireMenu.plats.length) {
      this.erreurMenus = 'Ajoutez au moins un plat au menu.';
      return;
    }
    this.enregistrementMenu = true;
    this.erreurMenus = '';
    const donneesModification: Partial<DonneesMenu> = {
      ...this.formulaireMenu,
      plats: this.formulaireMenu.plats.map((plat, index) => ({
        ...plat,
        ordre_affichage: index + 1,
      })),
    };

    const requete = this.menuEnEdition
      ? this.menusService.modifierMenu(this.menuEnEdition, donneesModification)
      : this.menusService.creerMenu(this.formulaireMenu);

    requete.subscribe({
      next: (reponse) => {
        this.messageMenus = reponse.message;
        this.enregistrementMenu = false;
        this.fermerFormulaireMenu();
        this.chargerGestionMenus();
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible d’enregistrer le menu.';
        this.enregistrementMenu = false;
      },
    });
  }

  supprimerMenu(menu: MenuGestion): void {
    if (!confirm(`Confirmer la suppression définitive du menu « ${menu.titre} » ?`)) {
      return;
    }

    this.erreurMenus = '';
    this.messageMenus = '';

    this.menusService.supprimerMenu(menu.id_menu).subscribe({
      next: (reponse) => {
        this.messageMenus = reponse.message;
        if (this.menuEnEdition === menu.id_menu) {
          this.fermerFormulaireMenu();
        }
        this.chargerGestionMenus();
      },
      error: (erreur) => {
        this.erreurMenus = erreur.error?.message || 'Impossible de supprimer ce menu.';
      },
    });
  }

  basculerDisponibilite(menu: MenuGestion): void {
    this.menusService.changerDisponibilite(menu.id_menu, !menu.disponible).subscribe({
      next: () => {
        this.messageMenus = `Disponibilité du menu « ${menu.titre} » mise à jour.`;
        this.chargerGestionMenus();
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible de modifier la disponibilité.';
      },
    });
  }

  editerPlat(plat: PlatGestion): void {
    this.platEnEdition = plat.id_plat;
    this.formulairePlatEdition = {
      nom: plat.nom,
      description: plat.description ?? '',
      categorie: plat.categorie,
      allergenes: [...(plat.allergenes ?? [])].map(Number),
    };
    this.erreurMenus = '';
    this.messageMenus = '';
  }

  annulerModificationPlat(): void {
    this.platEnEdition = null;
    this.formulairePlatEdition = {
      nom: '',
      description: '',
      categorie: 'plat',
      allergenes: [],
    };
  }

  modifierAllergenePlat(id: number, coche: boolean): void {
    if (coche && !this.formulairePlatEdition.allergenes.includes(id)) {
      this.formulairePlatEdition.allergenes.push(id);
    } else if (!coche) {
      this.formulairePlatEdition.allergenes =
        this.formulairePlatEdition.allergenes.filter((allergeneId) => allergeneId !== id);
    }
  }

  enregistrerModificationPlat(plat: PlatGestion): void {
    const nom = this.formulairePlatEdition.nom.trim();

    if (nom.length < 2) {
      this.erreurMenus = 'Le nom du plat doit contenir au moins deux caractères.';
      return;
    }

    this.enregistrementModificationPlat = true;
    this.erreurMenus = '';
    this.messageMenus = '';

    this.menusService.modifierPlat(plat.id_plat, {
      ...this.formulairePlatEdition,
      nom,
      allergenes: [...this.formulairePlatEdition.allergenes],
    }).subscribe({
      next: (reponse) => {
        this.messageMenus = reponse.message;
        this.annulerModificationPlat();
        this.chargerPlats();
        this.enregistrementModificationPlat = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible de modifier ce plat.';
        this.enregistrementModificationPlat = false;
        this.cdr.detectChanges();
      },
    });
  }

  supprimerPlat(plat: PlatGestion): void {
    if (!confirm(`Confirmer la suppression définitive du plat « ${plat.nom} » ?`)) {
      return;
    }

    this.erreurMenus = '';
    this.messageMenus = '';

    this.menusService.supprimerPlat(plat.id_plat).subscribe({
      next: (reponse) => {
        this.messageMenus = reponse.message;
        this.chargerPlats();
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible de supprimer ce plat.';
      },
    });
  }

  enregistrerPlat(): void {
    if (this.nouveauPlat.nom.trim().length < 2) {
      this.erreurMenus = 'Le nom du plat doit contenir au moins deux caractères.';
      return;
    }
    this.erreurMenus = '';
    this.menusService.creerPlat(this.nouveauPlat).subscribe({
      next: (reponse) => {
        this.messageMenus = reponse.message;
        this.nouveauPlat = { nom: '', description: '', categorie: 'plat', allergenes: [] };
        this.chargerPlats();
      },
      error: (e) => {
        this.erreurMenus = e.error?.message || 'Impossible de créer le plat.';
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
          return (
            horaire ?? {
              jour_semaine: jour.numero,
              heure_ouverture: '09:00',
              heure_fermeture: '18:00',
              ferme: false,
            }
          );
        });
        this.chargementHoraires = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurHoraires = erreur.error?.message || 'Impossible de charger les horaires.';
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
        this.messageHoraires = reponse.message;
        this.enregistrementHoraires = false;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        this.erreurHoraires = erreur.error?.message || 'Impossible d’enregistrer les horaires.';
        this.enregistrementHoraires = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnInit(): void {
    this.chargerCommandes();
    this.chargerAvis();
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
        this.erreur =
          'Impossible de charger les commandes. Vérifiez votre connexion et vos droits.';
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
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
        this.erreurAvis = erreur.error?.message || 'Impossible de charger les avis.';
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
          this.erreur =
            erreur.error?.message || 'Impossible de modifier le statut de cette commande.';
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
