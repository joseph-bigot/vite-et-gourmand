-- Migration : ajout de la gestion du prêt de matériel
-- et harmonisation des colonnes de livraison.
-- Compatible avec une base existante.

ALTER TABLE commande
    ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (distance_km >= 0),
    ADD COLUMN IF NOT EXISTS livraison_hors_bordeaux BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pret_materiel BOOLEAN NOT NULL DEFAULT FALSE;
