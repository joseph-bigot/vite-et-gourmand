
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Commande } from './entities/commande.entity.js';
import { EmailService } from '../email/email.service.js';

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
    private readonly emailService: EmailService,
  ) {}

  async trouverParUtilisateur(idUtilisateur: string) {
    return this.commandesRepository
      .createQueryBuilder('commande')
      .leftJoin(
        'historique_statut',
        'historique',
        `historique.id_historique = (
           SELECT h2.id_historique
           FROM historique_statut h2
           WHERE h2.id_commande = commande.id_commande
           ORDER BY h2.date_changement DESC, h2.id_historique DESC
           LIMIT 1
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
    emailClient: string,
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

    const resultat = await this.dataSource.transaction(async (manager) => {
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
        distance_km: distance_km.toFixed(2),
        livraison_hors_bordeaux,
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

    try {
      await this.emailService.envoyerEmail(
        emailClient,
        'Confirmation de votre commande - Vite & Gourmand',
        `Votre commande n°${resultat.commande.id_commande} a bien été enregistrée.\n\nDate de prestation : ${date_prestation}\nHeure : ${heure_prestation}\nLieu : ${lieu_prestation}\nNombre de personnes : ${nombre_personnes}\nMontant total : ${resultat.detail_prix.prix_total.toFixed(2)} €\n\nVotre commande est en attente de confirmation.`,
      );
    } catch (erreur) {
      console.error('Échec de l’envoi de l’e-mail de confirmation.', erreur);
    }

    return resultat;
  }

  async annulerCommande(
    idUtilisateur: string,
    idCommande: string,
    motif: string,
    moyenContact: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const commandes: Array<{ id_commande: string }> =
        await manager.query(
          `SELECT c.id_commande
           FROM commande c
           JOIN historique_statut h
             ON h.id_commande = c.id_commande
           WHERE c.id_commande = $1
             AND c.id_utilisateur = $2
             AND h.date_changement = (
               SELECT MAX(h2.date_changement)
               FROM historique_statut h2
               WHERE h2.id_commande = c.id_commande
             )
             AND h.statut = 'en_attente'
           FOR UPDATE OF c`,
          [idCommande, idUtilisateur],
        );

      if (commandes.length === 0) {
        throw new BadRequestException(
          'Commande introuvable ou non annulable.',
        );
      }

      if (!motif?.trim() || !moyenContact?.trim()) {
        throw new BadRequestException(
          'Le motif et le moyen de contact sont obligatoires.',
        );
      }

      await manager.query(
        `UPDATE commande
         SET motif_annulation = $1,
             moyen_contact_annulation = $2
         WHERE id_commande = $3
           AND id_utilisateur = $4`,
        [
          motif.trim(),
          moyenContact.trim(),
          idCommande,
          idUtilisateur,
        ],
      );

      await manager.query(
        `INSERT INTO historique_statut (id_commande, statut)
         VALUES ($1, 'annulee')`,
        [idCommande],
      );

      return { message: 'Commande annulée avec succès.' };
    });
  }

  async modifierCommande(
    idUtilisateur: string,
    idCommande: string,
    donnees: {
      date_prestation: string;
      heure_prestation: string;
      adresse_livraison: string;
      lieu_prestation: string;
      nombre_personnes: number;
    },
  ) {
    if (
      !donnees.date_prestation ||
      !donnees.heure_prestation ||
      !donnees.adresse_livraison?.trim() ||
      !donnees.lieu_prestation?.trim() ||
      !Number.isInteger(donnees.nombre_personnes) ||
      donnees.nombre_personnes <= 0
    ) {
      throw new BadRequestException(
        'Les informations de la commande sont invalides.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const commandes: Array<{
        id_commande: string;
        id_menu: string;
        frais_livraison: string;
        distance_km: string;
        livraison_hors_bordeaux: boolean;
      }> = await manager.query(
        `SELECT c.id_commande, c.id_menu, c.frais_livraison,
                c.distance_km, c.livraison_hors_bordeaux
         FROM commande c
         JOIN historique_statut h
           ON h.id_commande = c.id_commande
         WHERE c.id_commande = $1
           AND c.id_utilisateur = $2
           AND h.date_changement = (
             SELECT MAX(h2.date_changement)
             FROM historique_statut h2
             WHERE h2.id_commande = c.id_commande
           )
           AND h.statut = 'en_attente'
         FOR UPDATE OF c`,
        [idCommande, idUtilisateur],
      );

      const commande = commandes[0];

      if (!commande) {
        throw new BadRequestException(
          'Commande introuvable ou non modifiable.',
        );
      }

      const menus: Array<{
        prix_par_personne: string;
        nombre_minimum_personnes: number;
        disponible: boolean;
      }> = await manager.query(
        `SELECT prix_par_personne, nombre_minimum_personnes, disponible
         FROM menu
         WHERE id_menu = $1`,
        [commande.id_menu],
      );

      const menu = menus[0];

      if (!menu || !menu.disponible) {
        throw new BadRequestException(
          'Le menu de cette commande est indisponible.',
        );
      }

      if (donnees.nombre_personnes < menu.nombre_minimum_personnes) {
        throw new BadRequestException(
          `Ce menu exige au minimum ${menu.nombre_minimum_personnes} personnes.`,
        );
      }

      const prixBrut =
        Number(menu.prix_par_personne) * donnees.nombre_personnes;
      const reduction =
        donnees.nombre_personnes >= menu.nombre_minimum_personnes + 5
          ? Math.round(prixBrut * 10) / 100
          : 0;
      const prixMenu = Math.round(prixBrut * 100) / 100;
      const reductionArrondie = Math.round(reduction * 100) / 100;
      const fraisLivraison = commande.livraison_hors_bordeaux
        ? 5 + Number(commande.distance_km) * 0.59
        : 5;
      const fraisLivraisonArrondis =
        Math.round(fraisLivraison * 100) / 100;
      const prixTotal =
        Math.round(
          (prixMenu - reductionArrondie + fraisLivraisonArrondis) * 100,
        ) / 100;

      await manager.query(
        `UPDATE commande
         SET date_prestation = $1,
             heure_prestation = $2,
             adresse_livraison = $3,
             lieu_prestation = $4,
             nombre_personnes = $5,
             prix_menu = $6,
             montant_reduction = $7,
             frais_livraison = $8,
             prix_total = $9
         WHERE id_commande = $10
           AND id_utilisateur = $11`,
        [
          donnees.date_prestation,
          donnees.heure_prestation,
          donnees.adresse_livraison.trim(),
          donnees.lieu_prestation.trim(),
          donnees.nombre_personnes,
          prixMenu.toFixed(2),
          reductionArrondie.toFixed(2),
          fraisLivraisonArrondis.toFixed(2),
          prixTotal.toFixed(2),
          idCommande,
          idUtilisateur,
        ],
      );

      return {
        message: 'Commande modifiée avec succès.',
        detail_prix: {
          prix_menu: prixMenu,
          montant_reduction: reductionArrondie,
          frais_livraison: fraisLivraisonArrondis,
          prix_total: prixTotal,
        },
      };
    });
  }


  async trouverHistoriqueCommande(
    idUtilisateur: string,
    idCommande: string,
  ) {
    return this.dataSource.query(
      `SELECT h.statut, h.date_changement
       FROM historique_statut h
       JOIN commande c ON c.id_commande = h.id_commande
       WHERE c.id_commande = $1
         AND c.id_utilisateur = $2
       ORDER BY h.date_changement ASC`,
      [idCommande, idUtilisateur],
    );
  }



  async changerStatutCommande(
    idCommande: string,
    nouveauStatut: string,
    motif?: string,
    moyenContact?: string,
  ) {
    const transitionsAutorisees: Record<string, string[]> = {
      en_attente: ['acceptee', 'refusee'],
      acceptee: ['en_preparation'],
      en_preparation: ['en_livraison'],
      en_livraison: ['livree'],
      livree: ['attente_retour_materiel'],
      attente_retour_materiel: ['terminee'],
    };

    if (
      nouveauStatut === 'refusee' &&
      (!motif?.trim() || !moyenContact?.trim())
    ) {
      throw new BadRequestException(
        'Le motif et le moyen de contact sont obligatoires pour refuser une commande.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const commandes: Array<{ id_commande: string }> =
        await manager.query(
          'SELECT id_commande FROM commande WHERE id_commande = $1 FOR UPDATE',
          [idCommande],
        );

      if (commandes.length === 0) {
        throw new NotFoundException('Commande introuvable.');
      }

      const dernierStatut: Array<{ statut: string }> =
        await manager.query(
          `SELECT statut
           FROM historique_statut
           WHERE id_commande = $1
           ORDER BY date_changement DESC, id_historique DESC
           LIMIT 1`,
          [idCommande],
        );

      const statutActuel = dernierStatut[0]?.statut;

      if (
        !statutActuel ||
        !transitionsAutorisees[statutActuel]?.includes(nouveauStatut)
      ) {
        throw new BadRequestException(
          'Cette transition de statut est invalide.',
        );
      }

      if (nouveauStatut === 'refusee') {
        await manager.query(
          `UPDATE commande
           SET motif_annulation = $1,
               moyen_contact_annulation = $2
           WHERE id_commande = $3`,
          [motif!.trim(), moyenContact!.trim(), idCommande],
        );
      }

      await manager.query(
        'INSERT INTO historique_statut (id_commande, statut) VALUES ($1, $2)',
        [idCommande, nouveauStatut],
      );

      return { message: 'Statut de la commande mis à jour.' };
    });
  }



  async annulerCommandeParEmploye(
    idCommande: string,
    motif: string,
    moyenContact: string,
  ) {
    if (!motif?.trim() || !moyenContact?.trim()) {
      throw new BadRequestException(
        'Le motif et le moyen de contact sont obligatoires.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const commandes: Array<{ id_commande: string }> =
        await manager.query(
          'SELECT id_commande FROM commande WHERE id_commande = $1 FOR UPDATE',
          [idCommande],
        );

      if (commandes.length === 0) {
        throw new NotFoundException('Commande introuvable.');
      }

      const dernierStatut: Array<{ statut: string }> =
        await manager.query(
          `SELECT statut
           FROM historique_statut
           WHERE id_commande = $1
           ORDER BY date_changement DESC, id_historique DESC
           LIMIT 1`,
          [idCommande],
        );

      const statutActuel = dernierStatut[0]?.statut;

      if (
        !statutActuel ||
        ['annulee', 'refusee', 'terminee'].includes(statutActuel)
      ) {
        throw new BadRequestException(
          'Cette commande ne peut plus être annulée.',
        );
      }

      await manager.query(
        `UPDATE commande
         SET motif_annulation = $1,
             moyen_contact_annulation = $2
         WHERE id_commande = $3`,
        [motif.trim(), moyenContact.trim(), idCommande],
      );

      await manager.query(
        'INSERT INTO historique_statut (id_commande, statut) VALUES ($1, $2)',
        [idCommande, 'annulee'],
      );

      return { message: 'Commande annulée avec succès.' };
    });
  }

  async trouverToutesLesCommandes() {
    return this.dataSource.query(
      `SELECT
         c.id_commande,
         c.date_commande,
         c.date_prestation,
         c.heure_prestation,
         c.nombre_personnes,
         c.adresse_livraison,
         c.lieu_prestation,
         c.prix_total,
         u.nom AS nom_client,
         u.prenom AS prenom_client,
         u.email AS email_client,
         u.telephone AS telephone_client,
         m.titre AS titre_menu,
         h.statut
       FROM commande c
       JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
       JOIN menu m ON m.id_menu = c.id_menu
       JOIN historique_statut h
         ON h.id_historique = (
           SELECT h2.id_historique
           FROM historique_statut h2
           WHERE h2.id_commande = c.id_commande
           ORDER BY h2.date_changement DESC, h2.id_historique DESC
           LIMIT 1
         )
       ORDER BY c.date_commande DESC`,
    );
  }

}
