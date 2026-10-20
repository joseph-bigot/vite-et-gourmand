
# Modèle des statistiques — Vite & Gourmand

## Objectif

MongoDB sera utilisé pour stocker les données nécessaires aux statistiques administratives. PostgreSQL reste la base principale des données métier.

## Statistiques attendues

- Nombre de commandes par menu.
- Chiffre d’affaires par menu.
- Filtrage des statistiques par période.
- Filtrage par menu.

## Structure envisagée

Chaque document statistique pourra contenir :

- `menuId` : identifiant du menu dans PostgreSQL.
- `titreMenu` : titre du menu au moment de la commande.
- `commandeId` : identifiant de la commande dans PostgreSQL.
- `dateCommande` : date de référence pour les statistiques.
- `montant` : montant retenu pour le chiffre d’affaires.

## Cohérence des données

- PostgreSQL reste la source de vérité pour les commandes et les menus.
- MongoDB conserve une représentation destinée aux statistiques.
- Les identifiants permettent de rapprocher les statistiques des données PostgreSQL.
- Les montants statistiques devront être calculés à partir des commandes validées selon les règles métier définies dans le cahier des charges.
