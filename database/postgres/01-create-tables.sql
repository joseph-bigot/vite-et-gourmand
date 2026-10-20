
-- Vite & Gourmand
-- PostgreSQL 17
-- Création du schéma relationnel

BEGIN;

CREATE TABLE utilisateur (
    id_utilisateur BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    adresse TEXT,
    mot_de_passe_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client'
        CHECK (role IN ('client', 'employe', 'admin')),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE theme (
    id_theme BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE regime_alimentaire (
    id_regime BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE allergene (
    id_allergene BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE menu (
    id_menu BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_theme BIGINT NOT NULL REFERENCES theme(id_theme),
    id_regime BIGINT NOT NULL REFERENCES regime_alimentaire(id_regime),
    titre VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    prix_par_personne NUMERIC(10,2) NOT NULL
        CHECK (prix_par_personne >= 0),
    nombre_minimum_personnes INTEGER NOT NULL
        CHECK (nombre_minimum_personnes > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    conditions_commande TEXT NOT NULL,
    conditions_conservation TEXT NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plat (
    id_plat BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    categorie VARCHAR(20) NOT NULL
        CHECK (categorie IN ('entree', 'plat', 'dessert'))
);

CREATE TABLE composer_menu (
    id_menu BIGINT NOT NULL REFERENCES menu(id_menu) ON DELETE CASCADE,
    id_plat BIGINT NOT NULL REFERENCES plat(id_plat),
    quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
    ordre_affichage INTEGER NOT NULL DEFAULT 1 CHECK (ordre_affichage > 0),
    PRIMARY KEY (id_menu, id_plat)
);

CREATE TABLE plat_allergene (
    id_plat BIGINT NOT NULL REFERENCES plat(id_plat) ON DELETE CASCADE,
    id_allergene BIGINT NOT NULL REFERENCES allergene(id_allergene),
    PRIMARY KEY (id_plat, id_allergene)
);

CREATE TABLE image_menu (
    id_image BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_menu BIGINT NOT NULL REFERENCES menu(id_menu) ON DELETE CASCADE,
    chemin_image TEXT NOT NULL,
    texte_alternatif VARCHAR(255) NOT NULL,
    ordre_affichage INTEGER NOT NULL DEFAULT 1
        CHECK (ordre_affichage > 0)
);

CREATE TABLE commande (
    id_commande BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_menu BIGINT NOT NULL REFERENCES menu(id_menu),
    date_commande TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_prestation DATE NOT NULL,
    heure_prestation TIME NOT NULL,
    adresse_livraison TEXT NOT NULL,
    lieu_prestation VARCHAR(255) NOT NULL,
    nombre_personnes INTEGER NOT NULL CHECK (nombre_personnes > 0),
    prix_menu NUMERIC(10,2) NOT NULL CHECK (prix_menu >= 0),
    montant_reduction NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (montant_reduction >= 0),
    frais_livraison NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (frais_livraison >= 0),
    prix_total NUMERIC(10,2) NOT NULL CHECK (prix_total >= 0),
    motif_annulation TEXT,
    moyen_contact_annulation VARCHAR(50),
    date_limite_retour_materiel DATE,
    date_retour_materiel DATE,
    CHECK (
        date_retour_materiel IS NULL
        OR date_limite_retour_materiel IS NULL
        OR date_retour_materiel >= date_prestation
    )
);

CREATE TABLE historique_statut (
    id_historique BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_commande BIGINT NOT NULL REFERENCES commande(id_commande)
        ON DELETE CASCADE,
    statut VARCHAR(40) NOT NULL CHECK (
        statut IN (
            'en_attente',
            'acceptee',
            'refusee',
            'en_preparation',
            'en_livraison',
            'livree',
            'attente_retour_materiel',
            'terminee',
            'annulee'
        )
    ),
    date_changement TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avis (
    id_avis BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_commande BIGINT NOT NULL UNIQUE REFERENCES commande(id_commande),
    note SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT NOT NULL,
    statut_validation VARCHAR(20) NOT NULL DEFAULT 'en_attente'
        CHECK (statut_validation IN ('en_attente', 'approuve', 'rejete')),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE horaire (
    id_horaire BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jour_semaine SMALLINT NOT NULL UNIQUE
        CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_ouverture TIME,
    heure_fermeture TIME,
    ferme BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (
        ferme = TRUE
        OR (
            heure_ouverture IS NOT NULL
            AND heure_fermeture IS NOT NULL
            AND heure_fermeture > heure_ouverture
        )
    )
);

CREATE TABLE contact (
    id_contact BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sujet VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    date_envoi TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commande_utilisateur
    ON commande(id_utilisateur);

CREATE INDEX idx_commande_menu
    ON commande(id_menu);

CREATE INDEX idx_commande_date_prestation
    ON commande(date_prestation);

CREATE INDEX idx_historique_commande_date
    ON historique_statut(id_commande, date_changement DESC);

CREATE INDEX idx_menu_filtres
    ON menu(id_theme, id_regime, prix_par_personne, disponible);

COMMIT;
