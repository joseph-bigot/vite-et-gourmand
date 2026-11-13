import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menus } from './menus';

describe('Menus', () => {
  let component: Menus;
  let fixture: ComponentFixture<Menus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      providers: [provideRouter([])],imports: [Menus],
    }).compileComponents();

    fixture = TestBed.createComponent(Menus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
