import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';
import { Menus } from './features/menus/menus';
import { DetailMenu } from './features/detail-menu/detail-menu';
import { Commande } from './features/commandes/commande/commande';
import { Connexion } from './features/auth/connexion/connexion';
import { Inscription } from './features/auth/inscription/inscription';
import { EspaceClient } from './features/espace-client/espace-client';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { EspaceEmploye } from './features/espace-employe/espace-employe';

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
      {
        path: 'connexion',
        component: Connexion,
      },
      {
        path: 'inscription',
        component: Inscription,
      },
      {
        path: 'espace-client',
        component: EspaceClient,
        canActivate: [authGuard],
      },
      {
        path: 'espace-employe',
        component: EspaceEmploye,
        canActivate: [roleGuard],
      },
    ],
  },
];