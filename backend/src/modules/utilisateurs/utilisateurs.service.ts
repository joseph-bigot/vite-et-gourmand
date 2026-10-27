import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { EmailService } from '../email/email.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InscriptionDto } from './dto/inscription.dto.js';
import { ConnexionDto } from './dto/connexion.dto.js';
import { Utilisateur } from './entities/utilisateur.entity.js';
import { CreationEmployeDto } from './dto/creation-employe.dto.js';

@Injectable()
export class UtilisateursService {
  private readonly logger = new Logger(UtilisateursService.name);

  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateursRepository: Repository<Utilisateur>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async demanderReinitialisation(emailBrut: string): Promise<void> {
    const email = emailBrut.trim().toLowerCase();
    const utilisateur = await this.utilisateursRepository.findOne({
      where: { email, actif: true },
    });

    // Ne jamais révéler si un compte existe pour cette adresse.
    if (!utilisateur) return;

    const token = randomBytes(32).toString('hex');
    utilisateur.reset_password_token_hash = createHash('sha256')
      .update(token)
      .digest('hex');
    utilisateur.reset_password_expires_at = new Date(Date.now() + 30 * 60 * 1000);

    await this.utilisateursRepository.save(utilisateur);

    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200'
    ).replace(/\/$/, '');
    const lien = `${frontendUrl}/reinitialiser-mot-de-passe?token=${token}`;

    try {
      await this.emailService.envoyerEmail(
        utilisateur.email,
        'Réinitialisation de votre mot de passe - Vite & Gourmand',
        `Bonjour ${utilisateur.prenom},\n\nUne demande de réinitialisation de mot de passe a été effectuée pour votre compte.\n\nPour choisir un nouveau mot de passe dans les 30 minutes, ouvrez ce lien :\n${lien}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\nVite & Gourmand`,
      );
    } catch (error) {
      // Ne pas révéler l'existence du compte dans la réponse HTTP.
      this.logger.error('Échec de l’envoi du courriel de réinitialisation.');
      this.logger.debug(String(error));
    }
  }

  async reinitialiserMotDePasse(token: string, nouveauMotDePasse: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const utilisateur = await this.utilisateursRepository.findOne({
      where: { reset_password_token_hash: tokenHash },
    });

    if (
      !utilisateur ||
      !utilisateur.actif ||
      !utilisateur.reset_password_expires_at ||
      utilisateur.reset_password_expires_at.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException(
        'Ce lien est invalide ou expiré. Demandez une nouvelle réinitialisation.',
      );
    }

    utilisateur.mot_de_passe_hash = await bcrypt.hash(nouveauMotDePasse, 12);
    utilisateur.reset_password_token_hash = null;
    utilisateur.reset_password_expires_at = null;
    await this.utilisateursRepository.save(utilisateur);
  }

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


  async trouverEmployes() {
    const employes = await this.utilisateursRepository.find({
      where: { role: 'employe' },
      select: {
        id_utilisateur: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        date_creation: true,
      },
      order: { date_creation: 'DESC' },
    });

    return employes;
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