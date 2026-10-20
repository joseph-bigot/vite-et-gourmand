
-- Vite & Gourmand
-- Données de démonstration

BEGIN;

INSERT INTO theme (nom) VALUES
    ('Classique'),
    ('Festif'),
    ('Végétarien');

INSERT INTO regime_alimentaire (nom) VALUES
    ('Classique'),
    ('Végétarien'),
    ('Végétalien'),
    ('Sans gluten');

INSERT INTO allergene (nom) VALUES
    ('Gluten'),
    ('Lait'),
    ('Œufs'),
    ('Fruits à coque'),
    ('Soja');

INSERT INTO plat (nom, description, categorie) VALUES
    ('Velouté de saison', 'Velouté préparé avec des légumes de saison.', 'entree'),
    ('Feuilleté aux légumes', 'Feuilleté garni de légumes de saison.', 'entree'),
    ('Suprême de volaille', 'Volaille accompagnée de légumes rôtis.', 'plat'),
    ('Risotto aux champignons', 'Risotto crémeux aux champignons.', 'plat'),
    ('Fondant au chocolat', 'Dessert au chocolat.', 'dessert'),
    ('Tarte aux fruits', 'Tarte garnie de fruits de saison.', 'dessert');

INSERT INTO menu (
    id_theme,
    id_regime,
    titre,
    description,
    prix_par_personne,
    nombre_minimum_personnes,
    stock,
    conditions_commande,
    conditions_conservation,
    disponible
)
SELECT
    t.id_theme,
    r.id_regime,
    'Menu Classique',
    'Un menu traditionnel composé de produits de saison.',
    35.00,
    10,
    5,
    'Commande à confirmer selon les disponibilités.',
    'Conserver les préparations selon les consignes communiquées.',
    TRUE
FROM theme t
JOIN regime_alimentaire r ON r.nom = 'Classique'
WHERE t.nom = 'Classique';

INSERT INTO menu (
    id_theme,
    id_regime,
    titre,
    description,
    prix_par_personne,
    nombre_minimum_personnes,
    stock,
    conditions_commande,
    conditions_conservation,
    disponible
)
SELECT
    t.id_theme,
    r.id_regime,
    'Menu Festif',
    'Un menu conçu pour les repas de fête et les grandes occasions.',
    45.00,
    10,
    5,
    'Commande à confirmer selon les disponibilités.',
    'Conserver les préparations selon les consignes communiquées.',
    TRUE
FROM theme t
JOIN regime_alimentaire r ON r.nom = 'Classique'
WHERE t.nom = 'Festif';

INSERT INTO menu (
    id_theme,
    id_regime,
    titre,
    description,
    prix_par_personne,
    nombre_minimum_personnes,
    stock,
    conditions_commande,
    conditions_conservation,
    disponible
)
SELECT
    t.id_theme,
    r.id_regime,
    'Menu Végétarien',
    'Un menu végétarien autour des légumes et des produits de saison.',
    32.00,
    10,
    5,
    'Commande à confirmer selon les disponibilités.',
    'Conserver les préparations selon les consignes communiquées.',
    TRUE
FROM theme t
JOIN regime_alimentaire r ON r.nom = 'Végétarien'
WHERE t.nom = 'Végétarien';

INSERT INTO composer_menu (id_menu, id_plat, quantite, ordre_affichage)
SELECT m.id_menu, p.id_plat, 1,
       CASE p.categorie
           WHEN 'entree' THEN 1
           WHEN 'plat' THEN 2
           WHEN 'dessert' THEN 3
       END
FROM menu m
JOIN plat p ON
    (m.titre = 'Menu Classique' AND p.nom IN (
        'Velouté de saison', 'Suprême de volaille', 'Tarte aux fruits'
    ))
    OR
    (m.titre = 'Menu Festif' AND p.nom IN (
        'Feuilleté aux légumes', 'Suprême de volaille', 'Fondant au chocolat'
    ))
    OR
    (m.titre = 'Menu Végétarien' AND p.nom IN (
        'Velouté de saison', 'Risotto aux champignons', 'Tarte aux fruits'
    ));

INSERT INTO plat_allergene (id_plat, id_allergene)
SELECT p.id_plat, a.id_allergene
FROM plat p
JOIN allergene a ON
    (p.nom = 'Feuilleté aux légumes' AND a.nom = 'Gluten')
    OR
    (p.nom = 'Suprême de volaille' AND a.nom = 'Lait')
    OR
    (p.nom = 'Fondant au chocolat' AND a.nom IN ('Lait', 'Œufs'))
    OR
    (p.nom = 'Tarte aux fruits' AND a.nom = 'Gluten');

COMMIT;
