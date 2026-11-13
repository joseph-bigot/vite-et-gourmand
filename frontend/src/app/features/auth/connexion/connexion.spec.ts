import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Connexion } from './connexion';

describe('Connexion', () => {
  let component: Connexion;
  let fixture: ComponentFixture<Connexion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      providers: [provideRouter([])],imports: [Connexion],
    }).compileComponents();

    fixture = TestBed.createComponent(Connexion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
