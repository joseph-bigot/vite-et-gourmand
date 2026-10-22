
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InscriptionDto } from './dto/inscription.dto.js';
import { Utilisateur } from './entities/utilisateur.entity.js';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateursRepository: Repository<Utilisateur>,
  ) {}

  async inscrire(donnees: InscriptionDto) {
    const email = donnees.email.trim().toLowerCase();

    const utilisateurExistant = await this.utilisateursRepository.findOne({
      where: { email },
    });

    if (utilisateurExistant) {
      throw new ConflictException(
        'Un compte existe déjà avec cette adresse e-mail.',
      );
    }

    const motDePasseHash = await bcrypt.hash(donnees.motDePasse, 12);

    const utilisateur = this.utilisateursRepository.create({
      nom: donnees.nom.trim(),
      prenom: donnees.prenom.trim(),
      email,
      telephone: donnees.telephone?.trim() || null,
      mot_de_passe_hash: motDePasseHash,
      role: 'client',
      actif: true,
    });

    const utilisateurEnregistre =
      await this.utilisateursRepository.save(utilisateur);

    const { mot_de_passe_hash, ...utilisateurPublic } = utilisateurEnregistre;

    return utilisateurPublic;
  }
}
