# Vite & Gourmand

Application web de gestion et de commande de menus pour un traiteur bordelais.

## Technologies

- Frontend : Angular, TypeScript et SCSS
- Backend : NestJS et Node.js
- Base de données relationnelle : PostgreSQL
- Base de données NoSQL : MongoDB
- Environnement local : Docker

## Prérequis

- Node.js et npm
- Angular CLI
- Docker Desktop
- Git

## Installation

### 1. Récupérer le projet

```bash
git clone https://github.com/joseph-bigot/vite-et-gourmand.git
cd vite-et-gourmand
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet à partir de `.env.example`, puis renseigner les mots de passe locaux.

Ne jamais publier le fichier `.env` ni ses mots de passe.

### 3. Démarrer les bases de données

À la racine du projet, exécuter :

```bash
docker compose up -d
```

PostgreSQL est accessible sur le port local `5433`.
MongoDB est accessible sur le port local `27018`.

### 4. Initialiser PostgreSQL

Exécuter les scripts dans cet ordre, depuis la racine :

```bash
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/01-create-tables.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/02-seed-data.sql
```

Le script de démonstration est prévu pour une première initialisation.

### 5. Démarrer le backend

Dans un terminal :

```bash
cd backend
npm install
npm run start:dev
```

### 6. Démarrer le frontend

Dans un second terminal :

```bash
cd frontend
npm install
npx ng serve
```

L'application sera accessible à l'adresse http://localhost:4200.

## Structure du projet

- `frontend/` : application Angular
- `backend/` : API NestJS
- `database/postgres/` : scripts SQL
- `database/mongo/` : script d'initialisation MongoDB
- `cahier-des-charges.md` : cahier des charges fonctionnel
- `modele-de-donnees.md` : modèle de données
- `docker-compose.yml` : configuration des bases locales

## Sécurité

- Les secrets sont stockés dans des variables d'environnement.
- Le fichier `.env` est exclu du dépôt Git.
- Les mots de passe utilisateurs devront être stockés sous forme de hash.
- Les accès aux fonctionnalités seront contrôlés selon le rôle de l'utilisateur.

## État du projet

Projet en cours de développement dans le cadre de l'ECF Développeur Web et Web Mobile.