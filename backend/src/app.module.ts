import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UtilisateursModule } from './modules/utilisateurs/utilisateurs.module.js';
import { MenusModule } from './modules/menus/menus.module.js';
import { CommandesModule } from './modules/commandes/commandes.module.js';
import { AvisModule } from './modules/avis/avis.module.js';
import { HorairesModule } from './modules/horaires/horaires.module.js';
import { ContactModule } from './modules/contact/contact.module.js';
import { StatistiquesModule } from './modules/statistiques/statistiques.module.js';

@Module({
  imports: [UtilisateursModule, MenusModule, CommandesModule, AvisModule, HorairesModule, ContactModule, StatistiquesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
