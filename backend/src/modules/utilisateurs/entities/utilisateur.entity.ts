
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'utilisateur' })
export class Utilisateur {
  @PrimaryGeneratedColumn({ name: 'id_utilisateur', type: 'bigint' })
  id_utilisateur!: string;

  @Column({ type: 'varchar', length: 100 })
  nom!: string;

  @Column({ type: 'varchar', length: 100 })
  prenom!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone!: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  adresse!: string | null;

  @Column({ type: 'text', name: 'mot_de_passe_hash' })
  mot_de_passe_hash!: string;

  @Column({ type: 'varchar', length: 20, default: 'client' })
  role!: string;

  @Column({ type: 'boolean', default: true })
  actif!: boolean;

  @Column({
    type: 'timestamptz',
    name: 'date_creation',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date_creation!: Date;
}
