import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AvisPublic, AvisService } from '../../core/services/avis';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
})
export class Accueil implements OnInit, OnDestroy {
  private readonly avisService = inject(AvisService);
  private readonly cdr = inject(ChangeDetectorRef);
  avis: AvisPublic[] = [];
  private minuterieAvis?: ReturnType<typeof setInterval>;

  ngOnDestroy(): void {
    if (this.minuterieAvis) {
      clearInterval(this.minuterieAvis);
    }
  }
  indiceAvis = 0;

  avisPrecedent(): void {
    if (this.avis.length > 1) {
      this.indiceAvis =
        (this.indiceAvis - 1 + this.avis.length) % this.avis.length;
    }
  }

  avisSuivant(): void {
    if (this.avis.length > 1) {
      this.indiceAvis = (this.indiceAvis + 1) % this.avis.length;
      this.cdr.detectChanges();
    }
  }

  allerAVis(index: number): void {
    if (index >= 0 && index < this.avis.length) {
      this.indiceAvis = index;
    }
  }


  ngOnInit(): void {
    this.avisService.trouverAvisPublics().subscribe({
      next: (avis) => {
        this.avis = avis;

        if (avis.length > 1 && !this.minuterieAvis) {
          this.minuterieAvis = setInterval(() => {
            this.avisSuivant();
          }, 3000);
        }
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