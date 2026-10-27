import { IsEmail, MaxLength } from 'class-validator';

export class DemandeReinitialisationDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
