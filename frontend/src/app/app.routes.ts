import { Cgv } from './features/cgv/cgv';
import { MentionsLegales } from './features/mentions-legales/mentions-legales';
import { Contact } from './features/contact/contact';
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Accueil } from './features/accueil/accueil';
import { Menus } from './features/menus/menus';
import { DetailMenu } from './features/detail-menu/detail-menu';
import { Commande } from './features/commandes/commande/commande';
import { Connexion } from './features/auth/connexion/connexion';
import { Inscription } from './features/auth/inscription/inscription';
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
        { path: 'contact', component: Contact },
        { path: 'mentions-legales', component: MentionsLegales },
        { path: 'cgv', component: Cgv },
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