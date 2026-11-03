import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom!: string;

  @IsString()
  @IsIn(['Madame', 'Monsieur', 'Autre'])
  civilite!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;
}
