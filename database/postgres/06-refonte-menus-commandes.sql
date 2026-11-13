BEGIN;

-- Une seule photo par menu.
CREATE UNIQUE INDEX IF NOT EXISTS uq_image_menu_un_menu
ON image_menu (id_menu);

-- Composition choisie et figée au moment de la commande.
CREATE TABLE IF NOT EXISTS composition_commande (
    id_commande BIGINT NOT NULL,
    categorie VARCHAR(20) NOT NULL,
    id_plat BIGINT NULL,
    nom_plat VARCHAR(150) NOT NULL,
    description_plat TEXT,
    CONSTRAINT pk_composition_commande
        PRIMARY KEY (id_commande, categorie),
    CONSTRAINT ck_composition_commande_categorie
        CHECK (categorie IN ('entree', 'plat', 'dessert')),
    CONSTRAINT fk_composition_commande_commande
        FOREIGN KEY (id_commande)
        REFERENCES commande(id_commande)
        ON DELETE CASCADE,
    CONSTRAINT fk_composition_commande_plat
        FOREIGN KEY (id_plat)
        REFERENCES plat(id_plat)
        ON DELETE SET NULL
);

-- Catalogue cible : mise à jour des descriptions des plats portant
-- déjà exactement le même nom et insertion des plats manquants.
WITH catalogue(nom, description, categorie) AS (
    VALUES
    ('Salade de chèvre chaud', 'Toasts de chèvre, salade verte, noix et vinaigrette au miel.', 'entree'),
    ('Tartare de saumon et avocat', 'Saumon frais, avocat, citron vert et ciboulette.', 'entree'),
    ('Velouté de potimarron', 'Crème, éclats de noisettes et croûtons.', 'entree'),
    ('Tomates et mozzarella', 'Tomates fraîches, mozzarella, basilic et huile d’olive.', 'entree'),
    ('Feuilleté aux champignons', 'Pâte feuilletée, champignons et crème.', 'entree'),
    ('Suprême de poulet sauce forestière', 'Poulet rôti, sauce aux champignons et pommes grenailles.', 'plat'),
    ('Filet de saumon sauce citron', 'Saumon rôti, riz et légumes de saison.', 'plat'),
    ('Bœuf bourguignon', 'Bœuf mijoté au vin rouge, carottes et pommes de terre.', 'plat'),
    ('Lasagnes végétariennes', 'Légumes de saison, sauce tomate et béchamel.', 'plat'),
    ('Magret de canard sauce miel', 'Magret rôti, sauce au miel et pommes grenailles.', 'plat'),
    ('Tiramisu traditionnel', 'Mascarpone, café et cacao.', 'dessert'),
    ('Fondant au chocolat', 'Cœur coulant au chocolat noir.', 'dessert'),
    ('Tarte au citron meringuée', 'Crème citron et meringue.', 'dessert'),
    ('Crème brûlée', 'Crème vanillée et caramel croquant.', 'dessert'),
    ('Salade de fruits frais', 'Assortiment de fruits de saison.', 'dessert')
)
UPDATE plat p
SET description = c.description
FROM catalogue c
WHERE p.nom = c.nom
  AND p.categorie = c.categorie;

WITH catalogue(nom, description, categorie) AS (
    VALUES
    ('Salade de chèvre chaud', 'Toasts de chèvre, salade verte, noix et vinaigrette au miel.', 'entree'),
    ('Tartare de saumon et avocat', 'Saumon frais, avocat, citron vert et ciboulette.', 'entree'),
    ('Velouté de potimarron', 'Crème, éclats de noisettes et croûtons.', 'entree'),
    ('Tomates et mozzarella', 'Tomates fraîches, mozzarella, basilic et huile d’olive.', 'entree'),
    ('Feuilleté aux champignons', 'Pâte feuilletée, champignons et crème.', 'entree'),
    ('Suprême de poulet sauce forestière', 'Poulet rôti, sauce aux champignons et pommes grenailles.', 'plat'),
    ('Filet de saumon sauce citron', 'Saumon rôti, riz et légumes de saison.', 'plat'),
    ('Bœuf bourguignon', 'Bœuf mijoté au vin rouge, carottes et pommes de terre.', 'plat'),
    ('Lasagnes végétariennes', 'Légumes de saison, sauce tomate et béchamel.', 'plat'),
    ('Magret de canard sauce miel', 'Magret rôti, sauce au miel et pommes grenailles.', 'plat'),
    ('Tiramisu traditionnel', 'Mascarpone, café et cacao.', 'dessert'),
    ('Fondant au chocolat', 'Cœur coulant au chocolat noir.', 'dessert'),
    ('Tarte au citron meringuée', 'Crème citron et meringue.', 'dessert'),
    ('Crème brûlée', 'Crème vanillée et caramel croquant.', 'dessert'),
    ('Salade de fruits frais', 'Assortiment de fruits de saison.', 'dessert')
)
INSERT INTO plat (nom, description, categorie)
SELECT c.nom, c.description, c.categorie
FROM catalogue c
WHERE NOT EXISTS (
    SELECT 1
    FROM plat p
    WHERE p.nom = c.nom
      AND p.categorie = c.categorie
);

COMMIT;
