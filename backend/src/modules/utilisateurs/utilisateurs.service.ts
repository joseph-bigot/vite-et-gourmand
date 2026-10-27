import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InscriptionDto } from './dto/inscription.dto.js';
import { ConnexionDto } from './dto/connexion.dto.js';
import { Utilisateur } from './entities/utilisateur.entity.js';
import { CreationEmployeDto } from './dto/creation-employe.dto.js';

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


  async creerEmploye(donnees: CreationEmployeDto) {
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

    const employe = this.utilisateursRepository.create({
      nom: donnees.nom.trim(),
      prenom: donnees.prenom.trim(),
      email,
      telephone: null,
      adresse: null,
      mot_de_passe_hash: motDePasseHash,
      role: 'employe',
      actif: true,
    });

    const employeEnregistre = await this.utilisateursRepository.save(employe);
    const { mot_de_passe_hash, ...employePublic } = employeEnregistre;

    return employePublic;
  }


  async desactiverEmploye(id: string) {
    const employe = await this.utilisateursRepository.findOne({
      where: { id_utilisateur: id, role: 'employe' },
    });

    if (!employe) {
      throw new NotFoundException(
        'Compte employé introuvable.',
      );
    }

    employe.actif = false;
    const employeEnregistre = await this.utilisateursRepository.save(employe);
    const { mot_de_passe_hash, ...employePublic } = employeEnregistre;

    return employePublic;
  }

  async connecter(donnees: ConnexionDto) {
    const email = donnees.email.trim().toLowerCase();

    const utilisateur = await this.utilisateursRepository.findOne({
      where: { email },
    });

    if (
      !utilisateur ||
      !utilisateur.actif ||
      !(await bcrypt.compare(
        donnees.motDePasse,
        utilisateur.mot_de_passe_hash,
      ))
    ) {
      throw new UnauthorizedException(
        'Adresse e-mail ou mot de passe incorrect.',
      );
    }

    const { mot_de_passe_hash, ...utilisateurPublic } = utilisateur;

    return utilisateurPublic;
  }
}