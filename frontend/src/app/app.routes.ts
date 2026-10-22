
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';
import { Menus } from './features/menus/menus';
import { DetailMenu } from './features/detail-menu/detail-menu';
import { Commande } from './features/commandes/commande/commande';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Accueil,
      },
      {
        path: 'menus',
        component: Menus,
      },
      {
        path: 'menus/:id',
        component: DetailMenu,
      },
      {
        path: 'commande/:id',
        component: Commande,
      },
    ],
  },
];
