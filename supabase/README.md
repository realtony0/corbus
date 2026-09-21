# Schéma Supabase

Le schéma vit dans `migrations/`, au format attendu par l'intégration GitHub de
Supabase : elle applique les fichiers de ce dossier dans l'ordre de leur
préfixe horodaté. Un `schema.sql` à la racine du dossier, lui, est ignoré par
l'intégration — d'où ce découpage.

## Appliquer le schéma

**Via l'intégration GitHub** — connecter le dépôt dans Supabase
(Dashboard → Integrations → GitHub), puis pousser sur la branche suivie.

**À la main** — Dashboard → SQL Editor → New query → coller le contenu de
`migrations/20260921000000_init.sql` → Run. Le script est idempotent, donc
ré-exécutable sans risque.

## Vérifier que c'est passé

Dashboard → Table Editor : les tables `products` (3 lignes de seed) et
`site_content` (2 lignes, `settings` et `gallery`) doivent exister.
