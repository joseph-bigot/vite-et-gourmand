# Modèle de données — Vite & Gourmand

## 1. Objectif

Ce document prépare la conception des données de l’application Vite & Gourmand. Il définit les principales entités, leurs attributs et les relations à représenter dans le modèle conceptuel de données (MCD).

La base relationnelle PostgreSQL stockera les données principales de l’application. MongoDB sera réservé aux données nécessaires aux statistiques, conformément au cahier des charges.

## 2. Entités identifiées

### UTILISATEUR
- id_utilisateur
- nom
- prenom
- telephone
- email
- adresse
- mot_de_passe_hash
- role
- actif

### MENU
- id_menu
- titre
- description
- prix
- nombre_minimum_personnes
- stock
- conditions_commande
- conditions_conservation
- disponible

### PLAT
- id_plat
- nom
- description
- categorie

### COMMANDE
- id_commande
- id_utilisateur
- id_menu
- date_commande
- date_prestation
- heure_prestation
- adresse_livraison
- lieu_prestation
- nombre_personnes
- prix_menu
- montant_reduction
- frais_livraison
- prix_total
- motif_annulation
- moyen_contact_annulation

### HISTORIQUE_STATUT
- id_historique
- id_commande
- statut
- date_changement

### AVIS
- id_avis
- id_commande
- note
- commentaire
- statut_validation
- date_creation

### ALLERGENE
- id_allergene
- nom

### THEME
- id_theme
- nom

### REGIME_ALIMENTAIRE
- id_regime
- nom

### HORAIRE
- id_horaire
- jour_semaine
- heure_ouverture
- heure_fermeture

### IMAGE_MENU
- id_image
- id_menu
- chemin_image
- texte_alternatif

### CONTACT
- id_contact
- nom
- email
- sujet
- message
- date_envoi

## 3. Relations à modéliser

- Un utilisateur peut passer plusieurs commandes ; une commande appartient à un seul utilisateur.
- Un menu peut apparaître dans plusieurs commandes ; une commande concerne un seul menu.
- Un menu contient plusieurs plats et un plat peut être utilisé dans plusieurs menus.
- Un plat peut être associé à plusieurs allergènes ; un allergène peut concerner plusieurs plats.
- Un thème peut être associé à plusieurs menus ; chaque menu possède un thème.
- Un régime alimentaire peut être associé à plusieurs menus ; chaque menu possède un régime principal.
- Un menu peut posséder plusieurs images ; chaque image appartient à un menu.
- Une commande possède un historique de changements de statut.
- Une commande terminée peut recevoir un avis ; un avis concerne une seule commande.
- Les horaires sont enregistrés pour chaque jour de la semaine.
- Les messages envoyés depuis le formulaire de contact sont conservés dans la base.

## 4. Points à confirmer avant la création des tables

- Définir les tables d’association entre les menus et les plats, ainsi qu’entre les plats et les allergènes.
- Définir les valeurs autorisées pour les rôles, les statuts de commande et les statuts de validation des avis.
- Vérifier les cardinalités et les contraintes d’intégrité.
- Déterminer les données à envoyer vers MongoDB pour les statistiques.
- Définir précisément les règles de gestion du stock et de calcul des tarifs.

## 5. Statut du document

Ce document constitue une première proposition de conception. Il devra être validé et complété avant la création de la base PostgreSQL et des scripts SQL.