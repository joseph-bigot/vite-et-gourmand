
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'commande' })
export class Commande {
  @PrimaryGeneratedColumn({ name: 'id_commande', type: 'bigint' })
  id_commande!: string;

  @Column({ name: 'id_utilisateur', type: 'bigint' })
  id_utilisateur!: string;

  @Column({ name: 'id_menu', type: 'bigint' })
  id_menu!: string;

  @Column({
    name: 'date_commande',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date_commande!: Date;

  @Column({ name: 'date_prestation', type: 'date' })
  date_prestation!: string;

  @Column({ name: 'heure_prestation', type: 'time' })
  heure_prestation!: string;

  @Column({ name: 'adresse_livraison', type: 'text' })
  adresse_livraison!: string;

  @Column({ name: 'lieu_prestation', type: 'varchar', length: 255 })
  lieu_prestation!: string;

  @Column({ name: 'nombre_personnes', type: 'integer' })
  nombre_personnes!: number;

  @Column({ name: 'prix_menu', type: 'numeric', precision: 10, scale: 2 })
  prix_menu!: string;

  @Column({
    name: 'montant_reduction',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  montant_reduction!: string;

  @Column({
    name: 'frais_livraison',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  frais_livraison!: string;

  @Column({
    name: 'distance_km',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  distance_km!: string;

  @Column({
    name: 'livraison_hors_bordeaux',
    type: 'boolean',
    default: false,
  })
  livraison_hors_bordeaux!: boolean;

  @Column({ name: 'prix_total', type: 'numeric', precision: 10, scale: 2 })
  prix_total!: string;

  @Column({ name: 'motif_annulation', type: 'text', nullable: true })
  motif_annulation!: string | null;

  @Column({
    name: 'moyen_contact_annulation',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  moyen_contact_annulation!: string | null;

  @Column({ name: 'date_limite_retour_materiel', type: 'date', nullable: true })
  date_limite_retour_materiel!: string | null;

  @Column({ name: 'date_retour_materiel', type: 'date', nullable: true })
  date_retour_materiel!: string | null;
}
