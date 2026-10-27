import { IsIn } from 'class-validator';

export class ModererAvisDto {
  @IsIn(['approuve', 'rejete'])
  statut!: 'approuve' | 'rejete';
}
