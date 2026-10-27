import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'avis' })
export class Avis {
  @PrimaryGeneratedColumn({ name: 'id_avis', type: 'bigint' })
  id_avis!: string;

  @Column({ name: 'id_commande', type: 'bigint', unique: true })
  id_commande!: string;

  @Column({ name: 'note', type: 'smallint' })
  note!: number;

  @Column({ name: 'commentaire', type: 'text' })
  commentaire!: string;

  @Column({ name: 'statut_validation', type: 'varchar', length: 20, default: 'en_attente' })
  statut_validation!: 'en_attente' | 'approuve' | 'rejete';

  @Column({ name: 'date_creation', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date_creation!: Date;
}
