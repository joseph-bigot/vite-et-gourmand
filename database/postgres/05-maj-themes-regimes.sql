BEGIN;

-- Le menu végétarien conserve son régime alimentaire,
-- mais son thème devient Classique.
UPDATE menu
SET id_theme = (SELECT id_theme FROM theme WHERE nom = 'Classique')
WHERE id_theme = (SELECT id_theme FROM theme WHERE nom = 'Végétarien');

-- L'ancien thème Festif devient Événement.
UPDATE theme
SET nom = 'Événement'
WHERE nom = 'Festif';

-- Ajout des deux nouveaux thèmes.
INSERT INTO theme (nom)
VALUES ('Noël'), ('Pâques')
ON CONFLICT (nom) DO NOTHING;

-- Suppression de l'ancien thème devenu inutile.
DELETE FROM theme
WHERE nom = 'Végétarien';

-- Suppression du régime non retenu.
DELETE FROM regime_alimentaire
WHERE nom = 'Végétalien';

COMMIT;
