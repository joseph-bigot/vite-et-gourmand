import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Avis } from './entities/avis.entity.js';

@Injectable()
export class AvisService {
  constructor(
    @InjectRepository(Avis)
    private readonly avisRepository: Repository<Avis>,
    private readonly dataSource: DataSource,
  ) {}

  async trouverAvisApprouves() {
    return this.avisRepository
      .createQueryBuilder('avis')
      .innerJoin('commande', 'commande', 'commande.id_commande = avis.id_commande')
      .innerJoin(
        'utilisateur',
        'utilisateur',
        'utilisateur.id_utilisateur = commande.id_utilisateur',
      )
      .select([
        'avis.id_avis AS id_avis',
        'avis.note AS note',
        'avis.commentaire AS commentaire',
        'avis.date_creation AS date_creation',
        "LEFT(utilisateur.prenom, 1) || '. ' || utilisateur.nom AS auteur",
      ])
      .where('avis.statut_validation = :statut', { statut: 'approuve' })
      .orderBy('avis.date_creation', 'DESC')
      .getRawMany();
  }

  async trouverAvisEnAttente() {
    return this.avisRepository
      .createQueryBuilder('avis')
      .innerJoin('commande', 'commande', 'commande.id_commande = avis.id_commande')
      .innerJoin(
        'utilisateur',
        'utilisateur',
        'utilisateur.id_utilisateur = commande.id_utilisateur',
      )
      .select([
        'avis.id_avis AS id_avis',
        'avis.id_commande AS id_commande',
        'avis.note AS note',
        'avis.commentaire AS commentaire',
        'avis.date_creation AS date_creation',
        'utilisateur.prenom AS prenom_client',
        'utilisateur.nom AS nom_client',
      ])
      .where('avis.statut_validation = :statut', { statut: 'en_attente' })
      .orderBy('avis.date_creation', 'ASC')
      .getRawMany();
  }

  async modererAvis(idAvis: string, statut: 'approuve' | 'rejete') {
    if (!/^[1-9]\d*$/.test(idAvis)) {
      throw new BadRequestException('Identifiant d’avis invalide.');
    }

    if (!['approuve', 'rejete'].includes(statut)) {
      throw new BadRequestException('Le statut demandé est invalide.');
    }

    const resultat = await this.avisRepository
      .createQueryBuilder()
      .update(Avis)
      .set({ statut_validation: statut })
      .where('id_avis = :idAvis', { idAvis })
      .andWhere('statut_validation = :enAttente', { enAttente: 'en_attente' })
      .execute();

    if (resultat.affected === 0) {
      const existe = await this.avisRepository.exists({
        where: { id_avis: idAvis },
      });

      if (!existe) {
        throw new NotFoundException('Avis introuvable.');
      }

      throw new BadRequestException('Cet avis a déjà été modéré.');
    }

    return {
      message: statut === 'approuve' ? 'Avis approuvé.' : 'Avis rejeté.',
    };
  }

  async creerAvis(
    idUtilisateur: string,
    donnees: { id_commande: string; note: number; commentaire: string },
  ) {
    if (
      !/^[1-9]\d*$/.test(donnees.id_commande) ||
      !Number.isInteger(donnees.note) ||
      donnees.note < 1 ||
      donnees.note > 5 ||
      typeof donnees.commentaire !== 'string' ||
      donnees.commentaire.trim().length < 3 ||
      donnees.commentaire.trim().length > 2000
    ) {
      throw new BadRequestException(
        'La commande, la note ou le commentaire est invalide.',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const commandes: Array<{ id_commande: string }> = await manager.query(
        `SELECT c.id_commande
         FROM commande c
         WHERE c.id_commande = $1
           AND c.id_utilisateur = $2
           AND (
             SELECT h.statut
             FROM historique_statut h
             WHERE h.id_commande = c.id_commande
             ORDER BY h.date_changement DESC, h.id_historique DESC
             LIMIT 1
           ) = 'terminee'
         FOR UPDATE`,
        [donnees.id_commande, idUtilisateur],
      );

      if (commandes.length === 0) {
        throw new BadRequestException(
          'Seule une commande terminée vous appartenant peut recevoir un avis.',
        );
      }

      const dejaExistant: Array<{ id_avis: string }> = await manager.query(
        'SELECT id_avis FROM avis WHERE id_commande = $1',
        [donnees.id_commande],
      );

      if (dejaExistant.length > 0) {
        throw new BadRequestException(
          'Un avis existe déjà pour cette commande.',
        );
      }

      const avis = manager.create(Avis, {
        id_commande: donnees.id_commande,
        note: donnees.note,
        commentaire: donnees.commentaire.trim(),
        statut_validation: 'en_attente',
      });

      const enregistre = await manager.save(Avis, avis);

      return {
        message: 'Avis transmis pour modération.',
        avis: enregistre,
      };
      });
    } catch (erreur) {
      if (
        erreur instanceof QueryFailedError &&
        (erreur.driverError as { code?: string; constraint?: string }).code === '23505' &&
        (erreur.driverError as { constraint?: string }).constraint === 'avis_id_commande_key'
      ) {
        throw new BadRequestException(
          'Un avis existe déjà pour cette commande.',
        );
      }

      throw erreur;
    }
  }
}
