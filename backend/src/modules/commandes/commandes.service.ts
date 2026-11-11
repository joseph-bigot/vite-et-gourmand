
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
        'commande.pret_materiel AS pret_materiel',
        'commande.date_limite_retour_materiel AS date_limite_retour_materiel',
        'commande.date_retour_materiel AS date_retour_materiel',
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
        adresse_livraison: string;
        frais_livraison: string;
        distance_km: string;
        livraison_hors_bordeaux: boolean;
      }> = await manager.query(
        `SELECT c.id_commande, c.id_menu, c.adresse_livraison,
                c.frais_livraison, c.distance_km, c.livraison_hors_bordeaux
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

      if (
        commande.adresse_livraison.trim().toLocaleLowerCase('fr-FR') !==
        donnees.adresse_livraison.trim().toLocaleLowerCase('fr-FR')
      ) {
        throw new BadRequestException(
          'La modification de l’adresse de livraison nécessite une nouvelle vérification des frais de livraison. Contactez l’entreprise.',
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



  private calculerDateLimiteRetour(dateDepart: Date): string {
    const date = new Date(dateDepart);
    let joursOuvres = 0;

    while (joursOuvres < 10) {
      date.setDate(date.getDate() + 1);
      const jour = date.getDay();

      if (jour !== 0 && jour !== 6) {
        joursOuvres++;
      }
    }

    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');

    return `${annee}-${mois}-${jour}`;
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
      livree: ['attente_retour_materiel', 'terminee'],
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

    const resultat = await this.dataSource.transaction(async (manager) => {
      const commandes: Array<{
        id_commande: string;
        email_client: string;
        pret_materiel: boolean;
        date_limite_retour_materiel: string | null;
      }> = await manager.query(
        `SELECT c.id_commande, u.email AS email_client,
                c.pret_materiel, c.date_limite_retour_materiel
         FROM commande c
         JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
         WHERE c.id_commande = $1
         FOR UPDATE OF c`,
        [idCommande],
      );

      const commande = commandes[0];

      if (!commande) {
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

      if (nouveauStatut === 'acceptee') {
        const commandesAvecMenu: Array<{
          id_menu: string;
          distance_km: string;
          livraison_hors_bordeaux: boolean;
          frais_livraison: string;
        }> = await manager.query(
          `SELECT id_menu, distance_km, livraison_hors_bordeaux, frais_livraison
           FROM commande
           WHERE id_commande = $1`,
          [idCommande],
        );

        const commandeMenu = commandesAvecMenu[0];
        if (!commandeMenu) {
          throw new NotFoundException('Commande introuvable.');
        }

        const distance = Number(commandeMenu.distance_km);
        const fraisEnregistres = Number(commandeMenu.frais_livraison);
        const fraisAttendus = commandeMenu.livraison_hors_bordeaux
          ? 5 + distance * 0.59
          : 5;
        const fraisArrondis = Math.round(fraisAttendus * 100) / 100;

        if (
          !Number.isFinite(distance) ||
          distance < 0 ||
          !Number.isFinite(fraisEnregistres) ||
          Math.abs(fraisEnregistres - fraisArrondis) > 0.01
        ) {
          throw new BadRequestException(
            'Les frais de livraison sont incohérents. Vérifiez la distance avant d’accepter la commande.',
          );
        }

        const idMenu = commandeMenu.id_menu;
        if (!idMenu) {
          throw new NotFoundException('Menu de la commande introuvable.');
        }

        const menus: Array<{ stock: number }> = await manager.query(
          'SELECT stock FROM menu WHERE id_menu = $1 FOR UPDATE',
          [idMenu],
        );

        if (!menus.length || menus[0].stock <= 0) {
          throw new BadRequestException(
            'Le stock de ce menu est épuisé. La commande ne peut pas être acceptée.',
          );
        }

        const resultatStock = await manager.query(
          'UPDATE menu SET stock = stock - 1 WHERE id_menu = $1 AND stock > 0 RETURNING stock',
          [idMenu],
        );

        if (!resultatStock.length) {
          throw new BadRequestException(
            'Le stock de ce menu est épuisé. La commande ne peut pas être acceptée.',
          );
        }
      }

      let dateLimiteRetour: string | null = null;

      if (nouveauStatut === 'attente_retour_materiel') {
        dateLimiteRetour = this.calculerDateLimiteRetour(new Date());

        await manager.query(
          `UPDATE commande
           SET pret_materiel = TRUE,
               date_limite_retour_materiel = $1,
               date_retour_materiel = NULL
           WHERE id_commande = $2`,
          [dateLimiteRetour, idCommande],
        );
      }

      if (nouveauStatut === 'terminee') {
        if (statutActuel === 'attente_retour_materiel') {
          if (!commande.pret_materiel || !commande.date_limite_retour_materiel) {
            throw new BadRequestException(
              'Les informations de prêt de matériel sont incomplètes.',
            );
          }

          await manager.query(
            `UPDATE commande
             SET date_retour_materiel = CURRENT_DATE
             WHERE id_commande = $1`,
            [idCommande],
          );
        } else {
          await manager.query(
            `UPDATE commande
             SET pret_materiel = FALSE,
                 date_limite_retour_materiel = NULL,
                 date_retour_materiel = NULL
             WHERE id_commande = $1`,
            [idCommande],
          );
        }
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

      return {
        message: 'Statut de la commande mis à jour.',
        emailClient: commande.email_client,
        dateLimiteRetour,
      };
    });

    if (
      nouveauStatut === 'attente_retour_materiel' &&
      resultat.dateLimiteRetour
    ) {
      const [annee, mois, jour] = resultat.dateLimiteRetour.split('-');

      try {
        await this.emailService.envoyerEmail(
          resultat.emailClient,
          'Retour du matériel prêté - Vite & Gourmand',
          `Votre commande n°${idCommande} est en attente du retour du matériel prêté.

La date limite de restitution est le ${jour}/${mois}/${annee}.

Conformément aux conditions générales de vente, en cas de non-restitution du matériel dans un délai de 10 jours ouvrés, une pénalité de 600 € sera due.

Veuillez contacter Vite & Gourmand afin d'organiser la restitution du matériel.`,
        );
      } catch (erreur) {
        console.error(
          'Échec de l’envoi de l’e-mail concernant le retour du matériel.',
          erreur,
        );
      }
    }

    if (nouveauStatut === 'terminee') {
      try {
        await this.emailService.envoyerEmail(
          resultat.emailClient,
          'Votre commande est terminée - Donnez votre avis',
          `Bonjour,

Votre commande n°${idCommande} est maintenant terminée.

Nous vous invitons à vous connecter à votre espace client sur Vite & Gourmand afin de déposer votre avis.

Vous pourrez attribuer une note de 1 à 5 et partager votre expérience dans un commentaire.

Votre retour nous aidera à améliorer nos services.

À bientôt,
L'équipe Vite & Gourmand`,
        );
      } catch (erreur) {
        console.error(
          'Échec de l’envoi de l’e-mail invitant le client à donner son avis.',
          erreur,
        );
      }
    }

    return { message: resultat.message };
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

      if (
        ['acceptee', 'en_preparation', 'en_livraison'].includes(statutActuel)
      ) {
        const commandesAvecMenu: Array<{ id_menu: string }> =
          await manager.query(
            'SELECT id_menu FROM commande WHERE id_commande = $1',
            [idCommande],
          );

        const idMenu = commandesAvecMenu[0]?.id_menu;
        if (!idMenu) {
          throw new NotFoundException('Menu de la commande introuvable.');
        }

        await manager.query(
          'UPDATE menu SET stock = stock + 1 WHERE id_menu = $1',
          [idMenu],
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
         c.distance_km,
         c.livraison_hors_bordeaux,
         c.frais_livraison,
         c.lieu_prestation,
         c.prix_total,
         c.pret_materiel,
         c.date_limite_retour_materiel,
         c.date_retour_materiel,
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
