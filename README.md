# Vite & Gourmand

Application web de gestion et de commande de menus pour un traiteur bordelais.

Projet réalisé dans le cadre de l'ECF Développeur Web et Web Mobile.

## Technologies

- Frontend : Angular, TypeScript et SCSS
- Backend : Node.js et NestJS
- Base de données relationnelle : PostgreSQL
- Base de données NoSQL : MongoDB
- Environnement local : Docker

## Prérequis

- Node.js et npm
- Angular CLI
- Docker Desktop
- Git

## Installation en local

### 1. Récupérer le projet

~~~bash
git clone https://github.com/joseph-bigot/vite-et-gourmand.git
cd vite-et-gourmand
~~~

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet à partir de `.env.example`.

Renseigner les variables nécessaires au fonctionnement des bases de données et de l'application.

Ne jamais publier le fichier `.env` ni ses mots de passe.

### 3. Démarrer les bases de données

À la racine du projet :

~~~bash
docker compose up -d
~~~

- PostgreSQL : port local `5433`
- MongoDB : port local `27018`

### 4. Initialiser PostgreSQL

Exécuter les scripts SQL dans l'ordre, depuis la racine du projet :

~~~bash
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/01-create-tables.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/02-seed-data.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/03-reinitialisation-mot-de-passe.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/04-ajout-pret-materiel.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/05-maj-themes-regimes.sql
docker exec -i vite-gourmand-postgres psql -v ON_ERROR_STOP=1 -U vite_admin -d vite_gourmand < database/postgres/06-refonte-menus-commandes.sql
~~~

Les scripts doivent être exécutés dans l'ordre indiqué sur une base de données vierge. Les deux premiers créent la structure et insèrent les données initiales. Les scripts suivants appliquent les évolutions du schéma et du catalogue. Ne pas relancer cette procédure sur une base contenant déjà des données sans vérifier les effets de chaque script.

### 5. Initialiser MongoDB

Le script d'initialisation des collections et des index se trouve dans :

`database/mongo/01-create-collections.js`

Pour exécuter ce script depuis la racine du projet, sur une base MongoDB vierge :

~~~bash
docker exec -i vite-gourmand-mongo sh -c 'mongosh --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin vite_gourmand_stats --file /dev/stdin' < database/mongo/01-create-collections.js
~~~

Ce script crée la collection de statistiques et ses index. Il ne doit être exécuté qu'une seule fois lors de l'initialisation.

### 6. Démarrer le backend

Dans un premier terminal :

~~~bash
cd backend
npm ci
npm run start:dev
~~~

L'API NestJS démarre sur le port `3000`.

### 7. Démarrer le frontend

Dans un second terminal :

~~~bash
cd frontend
npm ci
npm start
~~~

L'application est accessible à l'adresse :

http://localhost:4200

## Structure du projet

- `frontend/` : application Angular
- `backend/` : API NestJS
- `database/postgres/` : scripts SQL
- `database/mongo/` : script d'initialisation MongoDB
- `cahier-des-charges.md` : cahier des charges fonctionnel
- `modele-de-donnees.md` : modèle de données
- `docker-compose.yml` : configuration des bases de données locales

## Commandes utiles

### Backend

~~~bash
npm run build
npm test
npm run lint
~~~

### Frontend

~~~bash
npm run build
npm test
~~~

## Déploiement

Application en ligne :

https://vitegourmand-ecf26-ce567dfbdb94.herokuapp.com/

Dépôt GitHub :

https://github.com/joseph-bigot/vite-et-gourmand

## Sécurité

- Les secrets sont stockés dans des variables d'environnement.
- Le fichier `.env` est exclu du dépôt Git.
- Les mots de passe utilisateurs sont protégés par un mécanisme de hachage.
- Les accès aux fonctionnalités sont contrôlés selon le rôle de l'utilisateur.

## État du projet

Projet réalisé dans le cadre de l'ECF Développeur Web et Web Mobile.
