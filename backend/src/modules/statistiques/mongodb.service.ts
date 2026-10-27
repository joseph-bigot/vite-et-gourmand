import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoDbService implements OnModuleInit, OnModuleDestroy {
  private client!: MongoClient;
  private database!: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('MONGO_HOST', 'localhost');
    const port = this.configService.get<string>('MONGO_PORT', '27018');
    const username = 'mongo_admin';
    const password = this.configService.get<string>('MONGO_PASSWORD');
    const databaseName = this.configService.get<string>(
      'MONGO_DATABASE',
      'vite_gourmand_stats',
    );

    if (!password) {
      throw new ServiceUnavailableException(
        'La variable MONGO_PASSWORD est absente.',
      );
    }

    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}?authSource=admin`,
      { serverSelectionTimeoutMS: 5000 },
    );

    await this.client.connect();
    this.database = this.client.db(databaseName);
    await this.database.command({ ping: 1 });
  }

  getDb(): Db {
    if (!this.database) {
      throw new ServiceUnavailableException(
        'La connexion MongoDB n’est pas initialisée.',
      );
    }

    return this.database;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }
}
