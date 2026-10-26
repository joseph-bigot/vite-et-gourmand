import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async verifierConnexion(): Promise<void> {
    await this.transporter.verify();
    this.logger.log('Connexion SMTP à Brevo vérifiée.');
  }

  async envoyerEmail(
    destinataire: string,
    sujet: string,
    contenuTexte: string,
  ): Promise<void> {
    const expediteur = this.configService.get<string>('MAIL_FROM');

    if (!expediteur) {
      throw new Error('La variable MAIL_FROM est absente.');
    }

    await this.transporter.sendMail({
      from: expediteur,
      to: destinataire,
      subject: sujet,
      text: contenuTexte,
    });

    this.logger.log(`E-mail envoyé à ${destinataire}`);
  }
}
