-- Vite & Gourmand : jetons de réinitialisation de mot de passe
-- À exécuter une seule fois sur la base PostgreSQL utilisée par l'application.

BEGIN;

ALTER TABLE utilisateur
  ADD COLUMN IF NOT EXISTS reset_password_token_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_utilisateur_reset_password_token_hash
  ON utilisateur (reset_password_token_hash)
  WHERE reset_password_token_hash IS NOT NULL;

COMMIT;
