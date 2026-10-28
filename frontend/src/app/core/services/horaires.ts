import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Horaire {
  jour_semaine: number;
  heure_ouverture: string | null;
  heure_fermeture: string | null;
  ferme: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HorairesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/horaires';

  private readonly horairesSubject = new BehaviorSubject<Horaire[] | null>(null);
  readonly horaires$ = this.horairesSubject.asObservable();

  lister(): Observable<Horaire[]> {
    return this.http.get<Horaire[]>(this.apiUrl).pipe(
      tap((horaires) => this.horairesSubject.next(horaires)),
    );
  }

  modifier(horaires: Horaire[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.apiUrl, horaires).pipe(
      tap(() => this.horairesSubject.next([...horaires])),
    );
  }
}
