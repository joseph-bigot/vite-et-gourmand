
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './entities/commande.entity.js';

@Injectable()
export class CommandesService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandesRepository: Repository<Commande>,
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
}
