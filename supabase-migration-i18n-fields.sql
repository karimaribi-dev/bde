-- Champs de traduction anglaise pour les événements
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en       text,
  ADD COLUMN IF NOT EXISTS description_en text;

-- Champs de traduction anglaise pour les produits
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS title_en       text,
  ADD COLUMN IF NOT EXISTS description_en text;
