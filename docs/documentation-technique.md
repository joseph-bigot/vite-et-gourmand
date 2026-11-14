# Documentation technique — Vite & Gourmand

Projet : Vite & Gourmand  
Formation : Développeur Web et Web Mobile — ECF  
Version : 1.0  
Dépôt GitHub : https://github.com/joseph-bigot/vite-et-gourmand  
Application en production : https://vitegourmand-ecf26-ce567dfbdb94.herokuapp.com/


# 1. Réflexion initiale sur les choix technologiques

## 1.1 Présentation du projet

Vite & Gourmand est une application web développée pour un traiteur bordelais. Elle permet aux visiteurs de consulter les menus proposés et aux clients de créer un compte, de passer des commandes et de suivre leur traitement.

L'application dispose également d'espaces dédiés aux employés et aux administrateurs afin de gérer les menus, les commandes, les avis, les horaires et les fonctionnalités d'administration.

L'architecture repose sur une séparation entre le frontend, le backend et les systèmes de stockage des données.

## 1.2 Technologies retenues

| Technologie | Version | Utilisation |
|---|---|---|
| Angular | 22 | Développement de l'interface utilisateur |
| TypeScript | 6 | Langage de développement typé |
| SCSS | - | Mise en forme de l'interface |
| Node.js | 26.x | Environnement d'exécution du backend |
| NestJS | 12 | Développement de l'API |
| PostgreSQL | 17 | Base de données relationnelle |
| MongoDB | 8 | Stockage des données statistiques |
| Docker | - | Environnement local des bases de données |
| Git | - | Gestion des versions |
| GitHub | - | Hébergement du code source |
| Heroku | - | Hébergement de l'application |
| Vitest | - | Tests automatisés |

## 1.3 Justification des choix technologiques

### Angular et TypeScript

Angular permet de construire une interface organisée en composants et services. Cette architecture facilite la réutilisation du code et la séparation des responsabilités.

TypeScript apporte un typage statique qui facilite la maintenance du projet et la détection des erreurs de développement.

### NestJS et Node.js

NestJS a été retenu pour développer l'API backend. Son architecture modulaire permet de séparer les différentes fonctionnalités métier et de structurer les contrôleurs et les services.

Node.js fournit l'environnement d'exécution nécessaire au backend.

### PostgreSQL

PostgreSQL constitue la base de données relationnelle principale de l'application.

Elle stocke notamment les utilisateurs, les menus, les plats, les commandes, les avis, les horaires et les historiques de statuts.

Les relations entre les données sont organisées à l'aide de clés primaires, de clés étrangères et de contraintes d'intégrité.

### MongoDB

MongoDB est utilisé pour les données statistiques relatives aux commandes.

Cette base NoSQL permet de disposer d'une représentation dédiée aux statistiques, distincte du modèle relationnel principal.

### Docker

Docker permet de démarrer PostgreSQL et MongoDB dans des conteneurs indépendants en environnement local.

Cette solution facilite la mise en place et la reproductibilité de l'environnement de développement.

### Git, GitHub et Heroku

Git assure le suivi des versions et des modifications du code.

GitHub héberge le dépôt source du projet. Heroku assure l'hébergement de l'application en production.


# 2. Configuration de l'environnement de travail

## 2.1 Prérequis

Les outils nécessaires au développement sont :

- Node.js et npm ;
- Angular CLI ;
- Docker Desktop ;
- Git ;
- Un éditeur de code ;
- Un terminal.

Le projet utilise Node.js 26.x, conformément à la propriété `engines` du fichier `package.json` situé à la racine.

## 2.2 Organisation des dossiers

L'organisation principale du projet est la suivante :

```text
vite-et-gourmand/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   └── modules/
│   ├── test/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── angular.json
│   └── package.json
│
├── database/
│   ├── postgres/
│   │   ├── 01-create-tables.sql
│   │   ├── 02-seed-data.sql
│   │   ├── 03-reinitialisation-mot-de-passe.sql
│   │   ├── 04-ajout-pret-materiel.sql
│   │   ├── 05-maj-themes-regimes.sql
│   │   └── 06-refonte-menus-commandes.sql
│   │
│   └── mongo/
│       ├── 01-create-collections.js
│       └── modele-statistiques.md
│
├── docs/
│   ├── diagrammes/
│   ├── charte-graphique.pdf
│   ├── mockups.pdf
│   ├── wireframes.pdf
│   ├── manuel-utilisation.pdf
│   ├── gestion-de-projet.md
│   └── documentation-technique.md
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
└── cahier-des-charges.md
```

## 2.3 Configuration des bases de données locales

Les bases de données sont démarrées à l'aide de Docker Compose.

Deux services sont configurés :

| Service | Image Docker | Port local | Port conteneur |
|---|---|---:|---:|
| PostgreSQL | postgres:17 | 5433 | 5432 |
| MongoDB | mongo:8 | 27018 | 27017 |

Les données sont conservées dans des volumes Docker nommés `postgres_data` et `mongo_data`.

Pour démarrer les conteneurs :

```bash
docker compose up -d
```

Pour arrêter les conteneurs :

```bash
docker compose down
```

Les informations de connexion sont configurées à l'aide de variables d'environnement dans un fichier `.env`, créé à partir du fichier `.env.example`.

Le fichier `.env` contient des informations sensibles et ne doit pas être publié dans le dépôt Git.

## 2.4 Initialisation de PostgreSQL

Les scripts SQL du dossier `database/postgres/` permettent de créer la structure relationnelle et d'appliquer ses évolutions.

Ils doivent être exécutés dans l'ordre suivant sur une base vierge :

1. `01-create-tables.sql` : création des tables, clés et contraintes.
2. `02-seed-data.sql` : insertion des données initiales.
3. `03-reinitialisation-mot-de-passe.sql` : évolution liée à la réinitialisation des mots de passe.
4. `04-ajout-pret-materiel.sql` : ajout de la gestion du prêt de matériel.
5. `05-maj-themes-regimes.sql` : mise à jour des thèmes et régimes alimentaires.
6. `06-refonte-menus-commandes.sql` : évolution de la gestion des menus et des commandes.

Ces scripts représentent les différentes étapes de construction et d'évolution du modèle relationnel.

Ils ne doivent pas être exécutés sans vérification sur une base contenant déjà des données.

## 2.5 Initialisation de MongoDB

Le script `database/mongo/01-create-collections.js` initialise la base `vite_gourmand_stats` et sa collection `statistiques_commandes`.

Il crée trois index :

- Un index unique sur `commandeId`, afin d'empêcher les doublons de commandes.
- Un index sur `dateCommande`, pour faciliter les recherches par date.
- Un index composé sur `menuId` et `dateCommande`, pour faciliter les recherches statistiques par menu et période.

Le script doit être exécuté lors de l'initialisation de la base.

## 2.6 Démarrage de l'application en local

### Démarrage du backend

Dans un premier terminal :

```bash
cd backend
npm ci
npm run start:dev
```

L'API NestJS utilise le port 3000 par défaut.

### Démarrage du frontend

Dans un second terminal :

```bash
cd frontend
npm ci
npm start
```

L'application Angular est accessible à l'adresse :

http://localhost:4200

## 2.7 Configuration des variables d'environnement

Les connexions aux bases de données sont paramétrées à l'aide de variables d'environnement.

### PostgreSQL

Les variables utilisées sont :

- `DATABASE_URL` : URI de connexion à la base ;
- `DATABASE_SSL` : contrôle de la connexion SSL ;
- `POSTGRES_HOST` : adresse du serveur ;
- `POSTGRES_PORT` : port ;
- `POSTGRES_USER` : utilisateur ;
- `POSTGRES_PASSWORD` : mot de passe ;
- `POSTGRES_DB` : nom de la base.

Lorsque `DATABASE_URL` est définie, elle est prioritaire sur les paramètres individuels.

Le SSL est activé par défaut dans cette configuration, sauf si `DATABASE_SSL` vaut `false`.

En local, les paramètres par défaut correspondent à PostgreSQL sur `localhost`, port `5433`, et à la base `vite_gourmand`.

### MongoDB

Les variables utilisées sont :

- `MONGODB_URI` : URI de connexion ;
- `MONGO_HOST` : adresse du serveur ;
- `MONGO_PORT` : port ;
- `MONGO_PASSWORD` : mot de passe ;
- `MONGO_DATABASE` : nom de la base.

Lorsque `MONGODB_URI` est renseignée, elle est utilisée pour établir la connexion.

En local, les paramètres par défaut utilisent le port `27018` et la base `vite_gourmand_stats`.

### Serveur backend

Le backend écoute sur le port défini par la variable `PORT`.

En l'absence de cette variable, le port `3000` est utilisé.

La configuration CORS tient également compte de l'environnement d'exécution et de la variable `FRONTEND_URL`.


# 3. Modèle conceptuel de données

## 3.1 Présentation du MCD

Le modèle conceptuel de données représente les principales entités métier de l'application ainsi que les relations qui les unissent.

Le diagramme est disponible dans le dossier :

`docs/diagrammes/`

Fichiers correspondants :

- `MCD — Vite & Gourmand.drawio` : fichier source modifiable ;
- `MCD — Vite & Gourmand.drawio.png` : export graphique du diagramme.

Le MCD permet de visualiser la structure générale des données avant leur implémentation dans PostgreSQL.

## 3.2 Principales entités

| Entité | Description |
|---|---|
| UTILISATEUR | Informations des clients, employés et administrateurs |
| MENU | Informations commerciales et caractéristiques des menus |
| PLAT | Entrées, plats principaux et desserts |
| THEME | Classification thématique des menus |
| REGIME_ALIMENTAIRE | Classification des menus selon les régimes |
| ALLERGENE | Référentiel des allergènes |
| COMPOSER_MENU | Association entre les menus et les plats |
| PLAT_ALLERGENE | Association entre les plats et les allergènes |
| IMAGE_MENU | Image associée à un menu |
| COMMANDE | Informations relatives aux commandes |
| COMPOSITION_COMMANDE | Composition sélectionnée lors d'une commande |
| HISTORIQUE_STATUT | Historique des changements de statut |
| AVIS | Avis déposés par les clients |
| HORAIRE | Horaires d'ouverture |
| CONTACT | Messages envoyés depuis le formulaire de contact |

## 3.3 Relations principales

Les principales relations représentées dans le MCD sont les suivantes :

- Un utilisateur peut effectuer plusieurs commandes.
- Une commande est rattachée à un seul utilisateur.
- Un menu peut être associé à plusieurs commandes.
- Une commande concerne un seul menu.
- Un menu est associé à un thème et à un régime alimentaire.
- Un menu peut être composé de plusieurs plats.
- Un plat peut appartenir à plusieurs menus.
- Un plat peut être associé à plusieurs allergènes.
- Une commande peut posséder plusieurs historiques de statuts.
- Une commande peut être associée à zéro ou un avis.
- Un menu peut posséder zéro ou une image.

Les relations plusieurs-à-plusieurs sont matérialisées par les tables d'association correspondantes.

## 3.4 Composition des commandes

La table `COMPOSITION_COMMANDE` conserve les informations relatives aux plats choisis lors d'une commande.

Elle contient notamment :

- `id_commande` : référence de la commande ;
- `categorie` : catégorie de composition ;
- `id_plat` : référence éventuelle au plat du catalogue ;
- `nom_plat` : nom du plat conservé ;
- `description_plat` : description conservée.

La clé primaire est composée de `id_commande` et `categorie`.

Cette structure permet de conserver une photographie de la composition commandée, indépendamment des évolutions ultérieures du catalogue.

## 3.5 Gestion des images des menus

La table `IMAGE_MENU` stocke les informations relatives à l'image associée à un menu.

La dernière évolution du schéma SQL impose une seule image par menu grâce à un index unique sur `id_menu`.

Cette règle est représentée dans le MCD par une relation permettant zéro ou une image pour un menu.

## 3.6 Utilisation de MongoDB pour les statistiques

PostgreSQL constitue la base de données relationnelle principale de l'application et conserve les données métier, notamment les commandes, les menus et leur historique de statuts.

MongoDB est utilisé pour stocker et exploiter les données destinées aux statistiques. Les commandes enregistrées dans PostgreSQL sont synchronisées dans la collection `statistiques_commandes`.

Chaque document statistique contient notamment les informations suivantes :

- `commandeId` : identifiant de la commande ;
- `menuId` : identifiant du menu associé ;
- `titreMenu` : titre du menu ;
- `dateCommande` : date de la commande ;
- `montant` : montant total ;
- `statut` : dernier statut connu de la commande.

La synchronisation individuelle est déclenchée après plusieurs opérations sur les commandes, notamment leur création, leur modification et leur annulation. Une synchronisation globale est également disponible.

Les statistiques sont calculées directement dans MongoDB à l'aide de requêtes d'agrégation. Elles permettent notamment d'obtenir :

- Le nombre total de commandes ;
- Le chiffre d'affaires ;
- La répartition des commandes par statut ;
- Le nombre de commandes et le chiffre d'affaires par menu.

Les résultats peuvent être filtrés par menu et par période. Les commandes annulées et refusées sont exclues du calcul du chiffre d'affaires.

En cas d'échec de la synchronisation individuelle, l'erreur est journalisée sans interrompre le traitement principal de la commande.

Cette architecture conserve PostgreSQL comme source de référence des données métier et utilise MongoDB pour leur exploitation statistique.

La synchronisation globale peut également être déclenchée à la demande par un administrateur via la route `POST /statistiques/synchroniser`. Cette route est protégée par une authentification JWT et un contrôle des rôles. Elle permet de mettre à jour l'ensemble des données statistiques à partir des commandes enregistrées dans PostgreSQL.


# 4. Diagrammes de cas d'utilisation et de séquence

## 4.1 Diagramme des cas d'utilisation

Le diagramme des cas d'utilisation est disponible dans :

- `docs/diagrammes/Cas-utilisation-Vite-et-Gourmand.drawio` ;
- `docs/diagrammes/Cas-utilisation-Vite-et-Gourmand.drawio.png`.

Il présente les quatre acteurs principaux de l'application.

### Visiteur

Le visiteur peut :

- Consulter les menus ;
- Filtrer les menus ;
- Consulter le détail d'un menu ;
- Créer un compte.

### Client

Le client peut :

- Se connecter ;
- Passer une commande ;
- Consulter ses commandes ;
- Modifier ou annuler une commande ;
- Déposer un avis ;
- Réinitialiser son mot de passe.

### Employé

L'employé dispose des fonctionnalités de gestion suivantes :

- Gestion des menus et des plats ;
- Gestion des commandes et de leurs statuts ;
- Gestion des horaires ;
- Gestion des avis clients ;
- Traitement des demandes de contact.

### Administrateur

L'administrateur dispose de fonctionnalités complémentaires :

- Consultation des statistiques ;
- Consultation du chiffre d'affaires ;
- Gestion des comptes employés ;
- Traitement des demandes de contact.

Le diagramme permet de visualiser les interactions entre les acteurs et les fonctionnalités proposées par le système.

## 4.2 Diagramme de séquence

Le diagramme de séquence est disponible dans :

- `docs/diagrammes/Diagramme-sequence-Vite-et-Gourmand.drawio` ;
- `docs/diagrammes/Diagramme-sequence-Vite-et-Gourmand.drawio.png`.

Il représente le scénario de passage d'une commande.

Les participants sont :

- Le client ;
- L'interface web ;
- L'API backend ;
- La base de données PostgreSQL.

### Déroulement du scénario

1. Le client déclenche une demande de commande depuis l'interface web.
2. L'interface transmet les informations à l'API backend.
3. Le backend interroge PostgreSQL afin de vérifier la disponibilité du stock.
4. PostgreSQL retourne le résultat de cette vérification.
5. Le backend procède à l'enregistrement des informations de commande lorsque le traitement peut se poursuivre.
6. Le backend confirme l'enregistrement à l'interface.
7. L'interface affiche une confirmation au client.

Ce diagramme illustre les échanges entre les différentes couches de l'application et permet de comprendre le cheminement d'une demande de commande.


# 5. Documentation du déploiement

## 5.1 Environnements de déploiement

Le projet distingue l'environnement local de l'environnement de production.

### Environnement local

En local, les bases de données PostgreSQL et MongoDB sont démarrées avec Docker Compose.

Le backend NestJS et le frontend Angular sont exécutés séparément.

Cette organisation facilite le développement, les tests et les corrections.

### Environnement de production

L'application est hébergée sur Heroku.

Adresse de production :

https://vitegourmand-ecf26-ce567dfbdb94.herokuapp.com/

Le code source est hébergé sur GitHub :

https://github.com/joseph-bigot/vite-et-gourmand

## 5.2 Configuration du déploiement Heroku

Le projet dispose d'un dépôt Git distant nommé `heroku`, associé à l'application `vitegourmand-ecf26`.

Le fichier `package.json` situé à la racine définit les scripts utilisés lors du déploiement.

Le script `heroku-postbuild` réalise les opérations suivantes :

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run build
npm --prefix frontend run build
```

Ces commandes installent les dépendances du backend et du frontend, puis compilent les deux applications.

Le script de démarrage en production est défini ainsi :

```bash
npm --prefix backend run start:prod
```

Dans le backend, le script `start:prod` exécute :

```bash
node dist/main
```

Le serveur utilise le port fourni par la variable d'environnement `PORT`, conformément au fonctionnement de l'environnement d'hébergement.

## 5.3 Configuration des bases en production

Les connexions aux bases de données sont paramétrées par des variables d'environnement.

Pour PostgreSQL, le backend accepte une URI `DATABASE_URL`. La configuration prévoit une connexion SSL par défaut dans ce cas.

Pour MongoDB, le backend accepte une URI `MONGODB_URI`.

Les valeurs des variables d'environnement doivent être configurées dans l'environnement d'hébergement.

Les mots de passe, URI de connexion et autres informations sensibles ne doivent jamais être intégrés au code source ou publiés dans le dépôt GitHub.

## 5.4 Gestion des versions avec Git

Le projet utilise Git pour suivre les évolutions du code.

Deux branches principales sont utilisées :

- `main` : branche principale contenant les versions intégrées ;
- `develop` : branche de développement.

Deux dépôts distants sont configurés :

- `origin` : dépôt GitHub ;
- `heroku` : dépôt de déploiement Heroku.

Cette organisation permet de séparer le suivi du code source et le déploiement de l'application.

## 5.5 Étapes générales de livraison

Le processus de livraison repose sur les étapes suivantes :

1. Réaliser les modifications sur la branche de développement.
2. Vérifier le fonctionnement des fonctionnalités concernées.
3. Exécuter les tests automatisés.
4. Vérifier la compilation du backend.
5. Vérifier la compilation du frontend.
6. Intégrer les modifications validées dans la branche principale.
7. Envoyer les modifications vers le dépôt distant GitHub.
8. Déployer la version validée sur Heroku.
9. Vérifier l'accessibilité de l'application en production.

Les scripts définis dans le projet assurent les opérations de construction et de démarrage de l'application sur Heroku.

## 5.6 Tests et vérifications

Les tests automatisés du backend sont exécutés avec Vitest.

Pour lancer les tests depuis la racine du projet :

```bash
cd backend && npm test
```

Pour générer un rapport de couverture :

```bash
cd backend && npm run test:cov
```

Une exécution des tests du backend a notamment permis de valider :

- 6 fichiers de tests ;
- 23 tests réussis.

La compilation du backend s'effectue avec :

```bash
cd backend && npm run build
```

La compilation du frontend s'effectue avec :

```bash
cd frontend && npm run build
```

Ces vérifications permettent de contrôler le fonctionnement et la compilation des différentes parties de l'application avant une livraison.

# Conclusion

L'architecture technique de Vite & Gourmand repose sur une séparation entre l'interface Angular, l'API NestJS, la base relationnelle PostgreSQL et la base MongoDB dédiée aux statistiques.

L'environnement local est reproductible grâce à Docker Compose et aux scripts d'initialisation des bases de données.

Le modèle relationnel organise les données métier et leurs relations, tandis que les diagrammes UML permettent de représenter les acteurs, les fonctionnalités et les échanges entre les composants.

Enfin, Git et GitHub assurent le suivi des versions du projet, tandis que Heroku héberge l'application en production.

Cette architecture fournit une base structurée pour le fonctionnement, la maintenance et l'évolution de l'application Vite & Gourmand.
