
/*
 * Vite & Gourmand
 * Initialisation des collections de statistiques MongoDB
 */

const database = db.getSiblingDB("vite_gourmand_stats");

database.createCollection("statistiques_commandes");

database.statistiques_commandes.createIndex(
  { commandeId: 1 },
  { unique: true, name: "idx_commande_unique" }
);

database.statistiques_commandes.createIndex(
  { dateCommande: 1 },
  { name: "idx_date_commande" }
);

database.statistiques_commandes.createIndex(
  { menuId: 1, dateCommande: 1 },
  { name: "idx_menu_date_commande" }
);

print("Initialisation des collections de statistiques terminée.");
