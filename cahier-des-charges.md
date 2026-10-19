# Cahier des charges fonctionnel — Vite & Gourmand

## 1. Présentation du projet

### 1.1 Contexte

Vite & Gourmand est une entreprise de traiteur composée de Julie et José, implantée à Bordeaux depuis 25 ans. Elle propose des menus adaptés à différents événements, notamment les fêtes de Noël, de Pâques et d’autres occasions particulières.

Jusqu’à présent, les menus sont principalement communiqués par e-mail aux clients habituels. L’entreprise souhaite disposer d’une application web afin d’améliorer sa visibilité, de présenter ses prestations à un public plus large et de faciliter les commandes en ligne.

### 1.2 Objectifs du projet

L’application doit permettre de :

- Présenter l’entreprise et son activité.
- Consulter les menus proposés et leurs caractéristiques.
- Filtrer les menus selon plusieurs critères.
- Permettre aux clients de commander en ligne et de suivre leurs commandes.
- Fournir aux employés des outils de gestion.
- Permettre à l’administrateur de gérer les comptes employés et de consulter les statistiques.
- Faciliter les échanges entre l’entreprise et ses clients.

### 1.3 Public concerné

L’application s’adresse aux visiteurs, aux clients, aux employés et à l’administrateur. Chaque catégorie dispose de fonctionnalités adaptées à ses besoins et à ses droits d’accès.

## 2. Périmètre du projet

Le projet comprend un site public accessible sans compte pour consulter les informations de l’entreprise et les menus, ainsi que des espaces nécessitant une authentification pour les clients, les employés et l’administrateur.

Les principales fonctionnalités concernent la consultation des menus, la gestion des comptes, la prise de commande, le suivi des commandes, la gestion interne, les avis clients, le formulaire de contact et les statistiques.

L’application devra être déployée en ligne, fonctionnelle, sécurisée et accessible conformément aux exigences du RGAA.

## 3. Utilisateurs et droits d’accès

### 3.1 Visiteur

Le visiteur peut :

- Consulter la page d’accueil et la présentation de l’entreprise.
- Consulter les menus et leurs détails.
- Utiliser les filtres de recherche.
- Consulter les horaires, les mentions légales et les CGV.
- Contacter l’entreprise.
- Créer un compte ou se connecter.

Pour passer commande, il doit se connecter ou créer un compte.

### 3.2 Client

Le client peut :

- Gérer ses informations personnelles.
- Consulter les menus et passer commande.
- Consulter ses commandes et leurs détails.
- Modifier ou annuler une commande tant qu’elle n’a pas été acceptée par un employé.
- Suivre les changements de statut de ses commandes.
- Déposer un avis après la fin d’une commande.

La modification d’une commande ne permet pas de remplacer le menu initialement choisi.

### 3.3 Employé

L’employé peut :

- Créer, modifier et supprimer des menus et des plats.
- Gérer les horaires d’ouverture.
- Consulter et filtrer les commandes.
- Traiter les commandes en respectant les règles de contact avec les clients.
- Annuler une commande en enregistrant le motif et le moyen de contact utilisé.
- Valider ou refuser les avis clients.

### 3.4 Administrateur

L’administrateur dispose des fonctionnalités accessibles aux employés. Il peut également :

- Créer des comptes employés.
- Désactiver les comptes employés.
- Consulter les statistiques du nombre de commandes par menu.
- Consulter le chiffre d’affaires par menu et sur une période donnée.

La création d’un compte administrateur depuis l’application doit être impossible. Le compte administrateur initial sera créé pour la livraison du projet.

## 4. Fonctionnalités attendues

### 4.1 Page d’accueil et navigation

La page d’accueil présente l’entreprise, son activité et le professionnalisme de son équipe. Elle affiche uniquement les avis clients validés.

La navigation permet d’accéder à l’accueil, à la liste des menus, à la connexion et au formulaire de contact.

Le pied de page contient :

- Les horaires d’ouverture pour chaque jour de la semaine, du lundi au dimanche.
- Les mentions légales.
- Les conditions générales de vente.

### 4.2 Consultation et recherche des menus

Les visiteurs et les clients connectés peuvent consulter la liste des menus disponibles.

Chaque menu présenté dans la liste comporte :

- Son titre.
- Sa description.
- Le nombre minimum de personnes.
- Le prix correspondant au nombre minimum de personnes.
- Un bouton permettant de consulter le détail du menu.

Des filtres permettent de rechercher les menus selon :

- Le prix maximal.
- Une fourchette de prix.
- Le thème.
- Le régime alimentaire.
- Le nombre minimum de personnes.

Les résultats doivent être actualisés sans rechargement complet de la page.

### 4.3 Détail d’un menu

La fiche détaillée d’un menu présente :

- Le titre et la description.
- Une galerie d’images.
- Le thème du menu.
- Les plats proposés, classés en entrées, plats principaux et desserts.
- Les allergènes associés à chaque plat.
- Le nombre minimum de personnes.
- Le prix correspondant.
- Le régime alimentaire.
- Les conditions de commande et de conservation.
- La disponibilité du menu.

Les thèmes peuvent notamment être Noël, Pâques, classique ou événementiel. Les régimes alimentaires comprennent notamment les options classique, végétarienne et végétalienne, avec la possibilité d’en ajouter d’autres.

Un même plat peut être utilisé dans plusieurs menus.

Les conditions de commande et de conservation doivent être clairement visibles. Un bouton permet d’accéder au formulaire de commande avec le menu sélectionné.

Si le visiteur n’est pas connecté, il doit être invité à se connecter ou à créer un compte avant de commander.

### 4.4 Inscription et authentification

Le formulaire d’inscription demande :

- Le nom.
- Le prénom.
- Le numéro de téléphone.
- L’adresse e-mail.
- L’adresse postale.
- Le mot de passe.

Le mot de passe doit comporter au minimum dix caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.

Après son inscription, l’utilisateur reçoit un e-mail de bienvenue.

La connexion s’effectue avec l’adresse e-mail et le mot de passe. Une fonctionnalité de réinitialisation du mot de passe permet d’envoyer un lien par e-mail.

Les rôles sont attribués selon les règles de l’application. Un utilisateur inscrit reçoit le rôle client. Les comptes employés sont créés par l’administrateur.

### 4.5 Commande en ligne

Le formulaire de commande reprend automatiquement les informations disponibles du client, notamment son nom, son prénom et son adresse e-mail. Le menu sélectionné depuis sa fiche doit également être prérempli.

Le formulaire demande les informations nécessaires à la livraison :

- L’adresse.
- La date.
- L’heure.
- Le lieu de livraison.
- Le nombre de personnes.

Le nombre de personnes doit être au moins égal au minimum prévu pour le menu.

Le prix est recalculé en fonction du menu choisi, du nombre de personnes, de la réduction éventuelle et des frais de livraison.

Avant la validation, le client doit pouvoir consulter un récapitulatif détaillé du prix.

Après la validation de la commande, un e-mail de confirmation est envoyé au client.

### 4.6 Espace client

Le client peut consulter ses commandes, leurs détails et l’historique de leurs changements de statut.

Chaque changement de statut doit être associé à une date et à une heure.

Le client peut modifier ses informations personnelles.

Tant que la commande n’a pas été acceptée par un employé, le client peut la modifier ou l’annuler. Lors d’une modification, le menu initialement choisi ne peut pas être remplacé.

Après acceptation, le client peut continuer à suivre sa commande, mais ne peut plus la modifier ou l’annuler selon la règle prévue dans l’énoncé.

Lorsque la commande est terminée, le client reçoit un e-mail l’invitant à déposer un avis comprenant une note de 1 à 5 et un commentaire.

### 4.7 Gestion des menus, des plats et des horaires

Les employés peuvent créer, modifier et supprimer des menus et des plats.

Ils peuvent également gérer les horaires d’ouverture de l’entreprise.

Les menus doivent tenir compte de leur disponibilité, des conditions de commande, des conditions de conservation, des allergènes et des régimes alimentaires.

### 4.8 Gestion des commandes par les employés

Les employés peuvent consulter et filtrer les commandes selon leur statut ou le client concerné.

Avant de modifier ou d’annuler une commande, ils doivent contacter le client par téléphone ou par e-mail.

En cas d’annulation par un employé, le motif de l’annulation et le moyen de contact utilisé doivent être enregistrés.

Les statuts de commande prévus sont :

1. Accepté.
2. En préparation.
3. En cours de livraison.
4. Livré.
5. En attente du retour de matériel.
6. Terminée.

Lorsque du matériel est prêté au client, le statut « en attente du retour de matériel » permet de suivre sa restitution.

Le client doit être informé qu’il dispose de dix jours ouvrés pour retourner le matériel. Les CGV prévoient une pénalité de 600 € en cas de non-retour. Le client doit contacter l’entreprise pour organiser la restitution.

Le statut « terminée » indique que la livraison est achevée et qu’aucun matériel ne reste à récupérer, ou que le matériel prêté a été restitué.

### 4.9 Gestion des avis clients

Lorsque la commande est terminée, le client reçoit un e-mail l’invitant à laisser un avis.

L’avis comporte une note comprise entre 1 et 5 et un commentaire.

Les employés et l’administrateur peuvent approuver ou rejeter les avis. Seuls les avis validés sont affichés sur la page d’accueil.

### 4.10 Administration et statistiques

L’administrateur peut créer des comptes employés à partir de leur adresse e-mail et d’un mot de passe.

L’employé reçoit un e-mail lui indiquant qu’un compte a été créé. Le mot de passe ne doit pas être communiqué dans cet e-mail ; il lui est transmis par l’administrateur.

L’administrateur peut désactiver un compte employé, notamment en cas de départ de l’entreprise.

Un tableau de bord permet de comparer le nombre de commandes par menu à l’aide d’un graphique. Les données utilisées pour ces statistiques doivent provenir de la base de données NoSQL.

Le chiffre d’affaires doit pouvoir être consulté par menu et sur une période donnée.

### 4.11 Formulaire de contact

Le formulaire de contact demande :

- Un titre.
- Une description.
- Une adresse e-mail.

La demande est envoyée par e-mail à l’entreprise afin qu’elle puisse répondre au visiteur.

### 4.12 Pages et informations complémentaires

Le site comporte les horaires d’ouverture du lundi au dimanche, les mentions légales et les conditions générales de vente. Ces informations doivent être accessibles depuis le pied de page.

## 5. Règles métier et calcul des tarifs

### 5.1 Prix des menus

Chaque menu possède un prix correspondant à son nombre minimum de personnes.

Le montant de la commande est calculé en fonction du menu choisi et du nombre de personnes commandées.

### 5.2 Réduction

Une réduction de 10 % s’applique lorsque le nombre de personnes commandées atteint au moins cinq personnes de plus que le minimum prévu pour le menu.

Le calcul doit être effectué côté serveur afin que le montant ne puisse pas être modifié uniquement depuis le navigateur.

### 5.3 Frais de livraison

Pour une livraison en dehors de Bordeaux, les frais indiqués dans l’énoncé sont de 5 € auxquels s’ajoutent 0,59 € par kilomètre parcouru.

Le calcul des frais doit être effectué à partir de la distance retenue pour la livraison. La méthode de calcul de cette distance devra être définie lors de la conception technique.

Le formulaire de commande doit présenter les frais de livraison et le montant total avant validation.

### 5.4 Récapitulatif de commande

Avant la validation, le client doit pouvoir consulter :

- Le menu choisi.
- Le nombre de personnes.
- Le montant du menu.
- La réduction éventuelle.
- Les frais de livraison.
- Le montant total à payer.

### 5.5 Gestion du stock

Chaque menu dispose d’un stock correspondant au nombre de commandes encore possibles.

Le stock est diminué lorsqu’un employé accepte une commande. Avant d’accepter une commande, l’application vérifie que le stock disponible est suffisant.

Si une commande acceptée est ensuite annulée, le stock correspondant est rétabli. Une commande ne peut pas être acceptée lorsque le stock disponible est épuisé.

Cette règle de gestion constitue un choix de conception pour le projet.

## 6. Contraintes techniques et sécurité

### 6.1 Architecture envisagée

L’application sera organisée en trois parties :

- Un front-end Angular avec TypeScript, HTML et SCSS.
- Un back-end Node.js avec NestJS, chargé de l’API et des règles métier.
- Deux bases de données : PostgreSQL pour les données principales et MongoDB pour les statistiques.

Cette architecture est un choix de conception. Les technologies ne sont pas imposées par l’énoncé, à l’exception de l’utilisation d’une base relationnelle et d’une base non relationnelle.

### 6.2 Protection des données

Les formulaires doivent vérifier les données saisies. Les contrôles sont effectués côté front-end pour faciliter l’utilisation et côté back-end pour empêcher l’enregistrement de données invalides.

Les mots de passe doivent être stockés sous une forme sécurisée, et non en clair.

Les accès aux fonctionnalités doivent être contrôlés côté serveur selon le rôle de l’utilisateur. Un client ne doit pouvoir consulter et modifier que ses propres données et commandes.

Les informations sensibles, notamment les mots de passe et les paramètres de connexion aux bases de données, ne doivent pas être publiées dans le dépôt GitHub.

Les échanges entre le navigateur et le serveur devront être sécurisés lors du déploiement.

### 6.3 Accessibilité

Les pages doivent être conçues en tenant compte des exigences du RGAA :

- Navigation au clavier.
- Libellés explicites pour les champs de formulaire.
- Structure cohérente des titres.
- Contrastes suffisants.
- Alternatives textuelles pour les images pertinentes.
- Messages d’erreur compréhensibles.
- Éléments interactifs utilisables au clavier.

L’accessibilité devra être vérifiée au cours des tests.

### 6.4 Compatibilité et affichage

L’application doit être utilisable sur ordinateur et sur mobile. Les interfaces doivent s’adapter aux différentes tailles d’écran.

### 6.5 Environnement de développement

Le projet utilise :

- Visual Studio Code pour l’édition du code.
- Git et GitHub pour le versionnement et l’hébergement du dépôt.
- Docker pour exécuter les bases de données dans des conteneurs.
- Trello pour organiser et suivre les tâches du projet.

Les instructions d’installation et de configuration seront documentées dans un fichier `README.md`.

## 7. Livrables attendus

Le projet doit fournir :

- Un dépôt GitHub public contenant le code source et un historique Git organisé.
- Un fichier `README.md` décrivant l’installation et l’exécution du projet en local.
- Les scripts SQL de création et d’initialisation des données.
- Une application déployée en ligne et fonctionnelle.
- Un lien vers le tableau Trello.
- Une charte graphique PDF présentant la palette de couleurs, les polices et les six maquettes : trois pour ordinateur et trois pour mobile.
- Un manuel utilisateur PDF présentant l’application et les identifiants nécessaires aux différents parcours de démonstration.
- Une documentation technique présentant les choix technologiques et la configuration de l’environnement.
- Un modèle conceptuel de données (MCD) ou un diagramme de classes.
- Un diagramme de cas d’utilisation et un diagramme de séquence.
- Une documentation de gestion de projet.
- Un guide de déploiement.
- Une copie Studi complétée avec les liens et les informations de connexion demandés.

## 8. Critères de validation

Le projet sera considéré comme prêt à être livré lorsque :

- Les visiteurs pourront consulter les menus et les informations de l’entreprise.
- Les filtres permettront de rechercher les menus selon les critères demandés.
- Les clients pourront créer un compte, commander et suivre leurs commandes.
- Les tarifs, les réductions et les frais de livraison respecteront les règles définies.
- Les employés pourront gérer les menus, les commandes et les avis selon leurs droits.
- L’administrateur pourra gérer les comptes employés et consulter les statistiques.
- Les données seront validées et les accès protégés.
- Les avis non validés ne seront pas visibles publiquement.
- Les e-mails prévus seront envoyés lors des actions concernées.
- L’application sera déployée, testée et accessible sur ordinateur comme sur mobile.
- Les livrables et la copie Studi seront complets.

## 9. Points à confirmer pendant la conception

Certains détails devront être précisés avant ou pendant le développement :

- La méthode de calcul de la distance pour les frais de livraison.
- Le mode de stockage et de mise à jour des statistiques dans MongoDB.
- Les modalités techniques d’envoi des e-mails.
- Les modalités de transmission sécurisée du mot de passe initial des employés.
- Les tests précis permettant de vérifier les règles tarifaires et les droits d’accès.

## 10. Justification des choix technologiques

### Front-end : Angular et TypeScript

Angular a été retenu pour développer une interface web structurée et organisée en composants réutilisables. Il permettra de créer les différentes pages de Vite & Gourmand : accueil, liste des menus, détails des menus, espace client et espaces de gestion. TypeScript apporte un typage qui facilite la maintenance et la détection d’erreurs.

### Design : HTML, SCSS et Angular Material

HTML définit la structure des pages, SCSS gère leur présentation et leur adaptation aux différents écrans. Angular Material fournit des composants d’interface cohérents, notamment pour les formulaires, les boutons et les tableaux.

### Back-end : Node.js et NestJS

Node.js permet d’exécuter le code JavaScript côté serveur. NestJS organise le back-end en modules et facilite la création d’une API. Cette API assurera la gestion des comptes, des menus, des commandes et des droits d’accès.

### Base de données relationnelle : PostgreSQL

PostgreSQL a été choisi pour stocker les données structurées : utilisateurs, menus, plats, commandes et statuts. Les relations entre ces données et les contraintes d’intégrité sont importantes pour garantir la cohérence des commandes.

### Base de données NoSQL : MongoDB

MongoDB sera utilisé pour les données statistiques nécessaires au tableau de bord administrateur, conformément aux exigences du projet. Il permettra de stocker et d’exploiter les données prévues pour les statistiques de commandes.

### Outils de travail

Visual Studio Code sera utilisé pour le développement. Git et GitHub permettront de suivre les modifications et de versionner le projet. Docker facilitera l’exécution des services nécessaires à l’environnement de développement. Trello permettra de suivre les tâches réparties entre les cinq phases du projet.