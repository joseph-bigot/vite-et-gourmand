import { IsEmail, IsString, MinLength } from 'class-validator';

export class ConnexionDto {
  @IsEmail({}, { message: 'L’adresse e-mail est invalide.' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Le mot de passe est obligatoire.' })
  motDePasse!: string;
}