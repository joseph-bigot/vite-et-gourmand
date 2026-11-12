
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { UtilisateursModule } from './modules/utilisateurs/utilisateurs.module.js';
import { MenusModule } from './modules/menus/menus.module.js';
import { CommandesModule } from './modules/commandes/commandes.module.js';
import { AvisModule } from './modules/avis/avis.module.js';
import { HorairesModule } from './modules/horaires/horaires.module.js';
import { ContactModule } from './modules/contact/contact.module.js';
import { StatistiquesModule } from './modules/statistiques/statistiques.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        ssl: configService.get('database.ssl'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    UtilisateursModule,
    MenusModule,
    CommandesModule,
    AvisModule,
    HorairesModule,
    ContactModule,
    StatistiquesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
