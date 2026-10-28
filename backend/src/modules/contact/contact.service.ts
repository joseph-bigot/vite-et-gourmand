import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service.js';
import { ContactDto } from './dto/contact.dto.js';

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async envoyerMessage(donnees: ContactDto): Promise<{ message: string }> {
    const destinataire = this.configService.get<string>('SMTP_USER');

    if (!destinataire) {
      throw new InternalServerErrorException(
        'Le destinataire des demandes de contact n’est pas configuré.',
      );
    }

    const sujet = `Demande de contact Vite & Gourmand — ${donnees.civilite}`;
    const contenu = [
      'Nouvelle demande depuis le formulaire de contact.',
      '',
      `Civilité : ${donnees.civilite}`,
      `Adresse e-mail : ${donnees.email}`,
      '',
      'Message :',
      donnees.description,
    ].join('\n');

    try {
      await this.emailService.envoyerEmail(destinataire, sujet, contenu);
    } catch {
      throw new InternalServerErrorException(
        'Impossible d’envoyer votre message pour le moment.',
      );
    }

    return { message: 'Votre message a bien été envoyé.' };
  }
}
