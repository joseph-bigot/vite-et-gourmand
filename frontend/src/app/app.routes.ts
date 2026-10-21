import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Accueil,
      },
    ],
  },
];