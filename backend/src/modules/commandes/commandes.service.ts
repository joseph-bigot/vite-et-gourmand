
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Commande } from './entities/commande.entity.js';

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

@Injectable()
export class CommandesService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandesRepository: Repository<Commande>,
    private readonly dataSource: DataSource,
  ) {}

  async trouverParUtilisateur(idUtilisateur: string) {
    return this.commandesRepository
      .createQueryBuilder('commande')
      .leftJoin(
        'historique_statut',
        'historique',
        `historique.id_commande = commande.id_commande
         AND historique.date_changement = (
           SELECT MAX(h2.date_changement)
           FROM historique_statut h2
           WHERE h2.id_commande = commande.id_commande
         )`,
      )
      .leftJoin('menu', 'menu', 'menu.id_menu = commande.id_menu')
      .select([
        'commande.id_commande AS id_commande',
        'commande.date_commande AS date_commande',
        'commande.date_prestation AS date_prestation',
        'commande.heure_prestation AS heure_prestation',
        'commande.nombre_personnes AS nombre_personnes',
        'commande.adresse_livraison AS adresse_livraison',
        'commande.lieu_prestation AS lieu_prestation',
        'commande.prix_total AS prix_total',
        'historique.statut AS statut',
        'menu.titre AS titre_menu',
      ])
      .where('commande.id_utilisateur = :idUtilisateur', {
        idUtilisateur,
      })
      .orderBy('commande.date_commande', 'DESC')
      .getRawMany();
  }

  async creerCommande(
    idUtilisateur: string,
    donnees: DonneesCommande,
  ) {
    const {
      id_menu,
      date_prestation,
      heure_prestation,
      adresse_livraison,
      lieu_prestation,
      nombre_personnes,
      distance_km,
      livraison_hors_bordeaux,
    } = donnees;

    if (
      !id_menu ||
      !date_prestation ||
      !heure_prestation ||
      !adresse_livraison?.trim() ||
      !lieu_prestation?.trim()
    ) {
      throw new BadRequestException(
        'Tous les champs obligatoires doivent être renseignés.',
      );
    }

    if (
      !Number.isInteger(nombre_personnes) ||
      nombre_personnes <= 0
    ) {
      throw new BadRequestException(
        'Le nombre de personnes doit être un entier positif.',
      );
    }

    if (
      typeof livraison_hors_bordeaux !== 'boolean' ||
      !Number.isFinite(distance_km) ||
      distance_km < 0
    ) {
      throw new BadRequestException(
        'Les informations de livraison sont invalides.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const menus: Array<{
        id_menu: string;
        prix_par_personne: string;
        nombre_minimum_personnes: number;
        disponible: boolean;
      }> = await manager.query(
        `SELECT id_menu, prix_par_personne,
                nombre_minimum_personnes, disponible
         FROM menu
         WHERE id_menu = $1`,
        [id_menu],
      );

      const menu = menus[0];

      if (!menu || !menu.disponible) {
        throw new NotFoundException(
          'Le menu sélectionné est introuvable ou indisponible.',
        );
      }

      if (nombre_personnes < menu.nombre_minimum_personnes) {
        throw new BadRequestException(
          `Ce menu exige au minimum ${menu.nombre_minimum_personnes} personnes.`,
        );
      }

      const prixBrut =
        Number(menu.prix_par_personne) * nombre_personnes;

      const reductionApplicable =
        nombre_personnes >= menu.nombre_minimum_personnes + 5;

      const montantReduction = reductionApplicable
        ? Math.round(prixBrut * 10) / 100
        : 0;

      const fraisLivraison = livraison_hors_bordeaux
        ? 5 + distance_km * 0.59
        : 5;

      const prixMenu = Math.round(prixBrut * 100) / 100;
      const reductionArrondie =
        Math.round(montantReduction * 100) / 100;
      const livraisonArrondie =
        Math.round(fraisLivraison * 100) / 100;
      const prixTotal =
        Math.round(
          (prixMenu - reductionArrondie + livraisonArrondie) * 100,
        ) / 100;

      const commande = this.commandesRepository.create({
        id_utilisateur: idUtilisateur,
        id_menu,
        date_prestation,
        heure_prestation,
        adresse_livraison: adresse_livraison.trim(),
        lieu_prestation: lieu_prestation.trim(),
        nombre_personnes,
        prix_menu: prixMenu.toFixed(2),
        montant_reduction: reductionArrondie.toFixed(2),
        frais_livraison: livraisonArrondie.toFixed(2),
        prix_total: prixTotal.toFixed(2),
      });

      const commandeEnregistree = await manager.save(
        Commande,
        commande,
      );

      await manager.query(
        `INSERT INTO historique_statut (id_commande, statut)
         VALUES ($1, $2)`,
        [commandeEnregistree.id_commande, 'en_attente'],
      );

      return {
        message: 'Commande créée avec succès.',
        commande: commandeEnregistree,
        detail_prix: {
          prix_menu: prixMenu,
          montant_reduction: reductionArrondie,
          frais_livraison: livraisonArrondie,
          prix_total: prixTotal,
        },
      };
    });
  }
}
