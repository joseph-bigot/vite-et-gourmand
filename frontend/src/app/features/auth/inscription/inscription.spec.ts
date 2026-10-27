import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inscription } from './inscription';

describe('Inscription', () => {
  let component: Inscription;
  let fixture: ComponentFixture<Inscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      providers: [provideRouter([])],imports: [Inscription],
    }).compileComponents();

    fixture = TestBed.createComponent(Inscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
