import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HorairesService, type Horaire } from '../../core/services/horaires';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit, OnDestroy {
  private readonly horairesService = inject(HorairesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private abonnementHoraires?: Subscription;

  readonly jours = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  horaires: Horaire[] = [];

  ngOnInit(): void {
    this.abonnementHoraires = this.horairesService.horaires$.subscribe(
      (horaires) => {
        if (horaires !== null) {
          this.horaires = horaires;
          this.cdr.detectChanges();
        }
      },
    );

    this.horairesService.lister().subscribe({
      error: (erreur) => {
        console.error('Impossible de charger les horaires.', erreur);
      },
    });
  }

  ngOnDestroy(): void {
    this.abonnementHoraires?.unsubscribe();
  }

  libelleHoraire(horaire: Horaire): string {
    if (horaire.ferme) return 'Fermé';

    if (!horaire.heure_ouverture || !horaire.heure_fermeture) {
      return 'Horaires indisponibles';
    }

    return `${horaire.heure_ouverture} à ${horaire.heure_fermeture}`;
  }
}
