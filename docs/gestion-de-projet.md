# Documentation de gestion de projet

## Projet Vite & Gourmand

### 1. Présentation de la gestion de projet

Le projet Vite & Gourmand a été réalisé dans le cadre de l'Évaluation en cours de formation (ECF) du titre professionnel Développeur Web et Web Mobile.

L'objectif était de concevoir et de développer une application web destinée à une entreprise de traiteur, en passant par les différentes étapes nécessaires à la réalisation d'un projet informatique : analyse des besoins, conception, maquettage, développement, tests et déploiement.

Afin de structurer le travail et de suivre l'avancement du projet, une organisation en cinq phases a été définie dès le début :

1. Préparation et analyse des besoins.
2. Architecture et conception des données.
3. Développement de l'application.
4. Tests et sécurisation.
5. Livraison et déploiement.

Cette organisation a permis de progresser de manière structurée, tout en conservant une vision globale des objectifs et des livrables attendus.

### 2. Organisation et suivi du projet

#### 2.1 Outil de gestion de projet

Le suivi des tâches a été organisé à l'aide de Trello, avec un tableau dédié au projet intitulé « Vite & Gourmand — Projet ECF ».

Cet outil permet de centraliser les tâches, de visualiser leur état d'avancement et de conserver une vue d'ensemble du travail restant à effectuer.

#### 2.2 Gestion des priorités

Les tâches ont été définies en tenant compte des dépendances entre les différentes étapes du projet.

Les travaux de conception ont notamment été réalisés avant le développement des fonctionnalités correspondantes. De la même manière, les fonctionnalités développées ont ensuite fait l'objet de vérifications et de corrections avant leur intégration dans la version principale de l'application.

Les priorités ont principalement été déterminées selon trois critères :

- Le caractère indispensable de la fonctionnalité au regard du cahier des charges.
- Les dépendances techniques avec les autres fonctionnalités.
- La nécessité de disposer d'une application fonctionnelle et déployée pour la livraison finale.

Cette approche a permis de concentrer les efforts sur les fonctionnalités essentielles avant de finaliser les éléments complémentaires et les documents attendus.

### 3. Déroulement du projet en cinq phases

#### Phase 1 — Préparation et analyse des besoins

Cette première phase a consisté à étudier le sujet de l'ECF, à comprendre les besoins de l'entreprise Vite & Gourmand et à définir le périmètre fonctionnel de l'application.

Les principaux travaux réalisés ont été :

- Analyse du contexte et des objectifs de l'entreprise.
- Identification des différents profils utilisateurs : visiteur, client, employé et administrateur.
- Recensement des fonctionnalités attendues pour chaque profil.
- Identification des principales règles de gestion.
- Rédaction du cahier des charges fonctionnel.
- Définition des premières orientations graphiques et techniques.

Cette phase a permis de disposer d'une base de référence pour les étapes suivantes et de limiter les risques d'oublis fonctionnels pendant le développement.

#### Phase 2 — Architecture et conception des données

La deuxième phase a porté sur la conception de l'application avant son développement.

Elle a notamment permis de définir l'organisation générale de la solution, les principales entités métier et les relations entre les données.

Les travaux réalisés comprennent :

- Définition de l'architecture générale de l'application.
- Choix des technologies adaptées au projet.
- Élaboration du modèle conceptuel de données (MCD).
- Réalisation du diagramme de cas d'utilisation.
- Réalisation du diagramme de séquence.
- Préparation de la structure des bases de données.
- Conception des wireframes et des maquettes graphiques pour les interfaces bureautiques et mobiles.
- Élaboration de la charte graphique.

Les diagrammes ont permis de représenter les données, les interactions entre les utilisateurs et l'application ainsi que le déroulement de certains traitements.

Les maquettes ont servi de référence visuelle pour le développement des interfaces.

#### Phase 3 — Développement de l'application

La troisième phase a consisté à développer les différentes fonctionnalités de Vite & Gourmand à partir du cahier des charges et des éléments de conception.

Le développement a été organisé autour des principaux espaces de l'application :

- Site public et consultation des menus.
- Gestion des comptes et authentification.
- Espace client et gestion des commandes.
- Espace employé et traitement des commandes.
- Espace administrateur et gestion des utilisateurs.
- Gestion des avis clients.
- Tableau de bord et statistiques.
- Gestion des informations et contenus de l'entreprise.

Le développement a été réalisé progressivement, en mettant en place les composants d'interface, les services applicatifs, les contrôleurs et les règles métier nécessaires.

Une attention particulière a été portée à la cohérence des données, aux droits d'accès et à la validation des informations transmises par les utilisateurs.

#### Phase 4 — Tests et sécurisation

Une phase de vérification a été consacrée au contrôle du fonctionnement de l'application.

Les vérifications ont porté notamment sur :

- Le fonctionnement des principales fonctionnalités.
- L'authentification et les droits associés aux différents profils.
- La validation des données saisies.
- La gestion des commandes et de leurs changements de statut.
- La cohérence des données enregistrées.
- Le comportement des interfaces sur ordinateur et mobile.
- La compilation du front-end et du back-end.
- La correction des anomalies détectées.

Des tests automatisés ont également été réalisés avec Vitest sur le back-end. Une campagne de tests a notamment abouti à six fichiers de tests réussis, représentant vingt-trois tests validés.

Les corrections ont été effectuées au fur et à mesure des anomalies identifiées, puis les vérifications ont été relancées afin de limiter les régressions.

#### Phase 5 — Livraison et déploiement

La dernière phase a consisté à préparer la mise à disposition de l'application et à réunir les livrables nécessaires à l'évaluation.

Elle comprend :

- La préparation de l'environnement de production.
- Le déploiement de l'application sur Heroku.
- Les vérifications de fonctionnement après déploiement.
- La préparation du dépôt GitHub.
- La rédaction du manuel utilisateur.
- La réalisation de la charte graphique.
- L'export des wireframes et des maquettes.
- La préparation des documentations technique et de gestion de projet.

Cette phase vise à fournir une application accessible en ligne ainsi que les documents permettant de comprendre son fonctionnement, sa conception et son installation.

### 4. Gestion du code source et versionnement

Le code source est hébergé sur GitHub afin de conserver un historique des évolutions et de sécuriser le suivi des modifications.

Deux branches principales structurent le dépôt :

- **main :** branche contenant la version principale du projet.
- **develop :** branche utilisée pour les développements et les évolutions.

Les modifications sont enregistrées sous forme de commits avec des messages décrivant leur objectif : ajout de fonctionnalité, correction, amélioration graphique ou documentation.

Le travail est ensuite intégré à la branche principale après vérification de la version de développement.

Cette organisation permet de distinguer les évolutions en cours de la version destinée à la livraison.

Le dépôt GitHub constitue également un support de traçabilité : il permet de retrouver les principales étapes du développement et les modifications apportées au projet.

### 5. Adaptation de l'organisation en cours de projet

La réalisation du projet a nécessité des ajustements au fur et à mesure de l'avancement.

Certaines fonctionnalités ont demandé des vérifications complémentaires, notamment lorsqu'elles impliquaient plusieurs éléments de l'application : interface utilisateur, API, règles métier et persistance des données.

Les anomalies détectées pendant les tests ont conduit à effectuer des corrections ciblées avant de poursuivre ou de finaliser les fonctionnalités concernées.

La conception graphique a également été formalisée à travers des maquettes bureautiques et mobiles afin de disposer de références cohérentes pour les interfaces finales.

L'organisation initiale en cinq phases a ainsi été conservée, tout en permettant des retours ponctuels vers les étapes précédentes lorsque des ajustements étaient nécessaires.

### 6. Bilan de la gestion de projet

L'organisation du projet autour de cinq phases a permis de structurer le travail depuis l'analyse initiale jusqu'à la livraison de l'application.

L'utilisation de Trello a facilité le suivi des tâches et la visualisation de leur état d'avancement. Git et GitHub ont permis de conserver un historique des modifications et de structurer l'intégration du code.

La démarche a également permis de produire les principaux éléments de conception en amont du développement : cahier des charges, modèle de données, diagrammes, wireframes, maquettes et charte graphique.

Enfin, les phases de tests et de déploiement ont permis de vérifier le fonctionnement de l'application et de préparer les livrables attendus dans le cadre de l'ECF.

Cette gestion de projet a apporté un cadre de travail structuré, tout en conservant une capacité d'adaptation face aux difficultés techniques et aux évolutions rencontrées pendant la réalisation de Vite & Gourmand.
