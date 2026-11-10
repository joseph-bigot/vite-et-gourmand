import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';

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
        loadComponent: () => import('./features/menus/menus').then(m => m.Menus),
      },
      {
        path: 'menus/:id',
        loadComponent: () => import('./features/detail-menu/detail-menu').then(m => m.DetailMenu),
      },
      {
        path: 'commande/:id',
        loadComponent: () => import('./features/commandes/commande/commande').then(m => m.Commande),
        canActivate: [authGuard],
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
        loadComponent: () => import('./features/auth/mot-de-passe-oublie/mot-de-passe-oublie').then(m => m.MotDePasseOublie),
      },
      {
        path: 'reinitialiser-mot-de-passe',
        loadComponent: () => import('./features/auth/reinitialiser-mot-de-passe/reinitialiser-mot-de-passe').then(m => m.ReinitialiserMotDePasse),
      },
      {
        path: 'espace-client',
        loadComponent: () => import('./features/espace-client/espace-client').then(m => m.EspaceClient),
        canActivate: [authGuard],
      },
      {
        path: 'espace-employe',
        loadComponent: () => import('./features/espace-employe/espace-employe').then(m => m.EspaceEmploye),
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