-- Ajoute la colonne mail à la table suggestions
alter table suggestions add column if not exists mail text;
