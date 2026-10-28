import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';
import { Menus } from './features/menus/menus';
import { DetailMenu } from './features/detail-menu/detail-menu';
import { Commande } from './features/commandes/commande/commande';
import { MotDePasseOublie } from './features/auth/mot-de-passe-oublie/mot-de-passe-oublie';
import { ReinitialiserMotDePasse } from './features/auth/reinitialiser-mot-de-passe/reinitialiser-mot-de-passe';
import { EspaceClient } from './features/espace-client/espace-client';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';
import { EspaceEmploye } from './features/espace-employe/espace-employe';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
        { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.Contact) },
        { path: 'mentions-legales', loadComponent: () => import('./features/mentions-legales/mentions-legales').then(m => m.MentionsLegales) },
        { path: 'cgv', loadComponent: () => import('./features/cgv/cgv').then(m => m.Cgv) },
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
        loadComponent: () => import('./features/auth/connexion/connexion').then(m => m.Connexion),
      },
      {
        path: 'inscription',
        loadComponent: () => import('./features/auth/inscription/inscription').then(m => m.Inscription),
      },
      {
        path: 'mot-de-passe-oublie',
        component: MotDePasseOublie,
      },
      {
        path: 'reinitialiser-mot-de-passe',
        component: ReinitialiserMotDePasse,
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
      {
        path: 'espace-admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/espace-admin/espace-admin').then(m => m.EspaceAdmin),
      },
    ],
  },
];