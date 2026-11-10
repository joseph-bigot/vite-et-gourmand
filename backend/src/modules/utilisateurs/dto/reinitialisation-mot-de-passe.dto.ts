import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ReinitialisationMotDePasseDto {
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  token!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{10,72}$/, {
    message: 'Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
  })
  motDePasse!: string;
}
