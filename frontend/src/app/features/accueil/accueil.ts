import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AvisPublic, AvisService } from '../../core/services/avis';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
})
export class Accueil implements OnInit {
  private readonly avisService = inject(AvisService);
  private readonly cdr = inject(ChangeDetectorRef);
  avis: AvisPublic[] = [];

  ngOnInit(): void {
    this.avisService.trouverAvisPublics().subscribe({
      next: (avis) => {
        this.avis = avis;
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        console.error('Erreur de chargement des avis :', erreur);
        this.avis = [];
        this.cdr.detectChanges();
      },
    });
  }
}