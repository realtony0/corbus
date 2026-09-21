# Déploiement — Cloudflare + Supabase + R2

Le site est un Next.js 16 déployé sur Cloudflare Workers via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (c'est ce que
Cloudflare recommande aujourd'hui pour Next.js ; « Pages » reste le nom du
tableau de bord, le runtime est Workers).

- **Base de données** : Supabase (Postgres, accès HTTP PostgREST)
- **Images uploadées** : bucket R2 `corbus-media`, lié au worker sous le nom `MEDIA`
- **Admin** : mot de passe vérifié côté serveur + cookie de session signé

---

## Chemin le plus court (aucune commande à taper)

1. **Supabase** — créer le projet, appliquer le schéma (voir [`supabase/README.md`](supabase/README.md))
   (détails en §1). Récupérer l'URL du projet et la clé `service_role`.
2. **R2** — dashboard Cloudflare → R2 → *Create bucket* → `corbus-media`, puis
   Settings → activer l'accès public et noter l'URL obtenue.
3. **Token** — dashboard Cloudflare → My Profile → API Tokens → *Create Token*
   → modèle **Edit Cloudflare Workers**. Noter aussi l'Account ID (page
   d'accueil Workers & Pages).
4. **GitHub** — dépôt → Settings → Secrets and variables → Actions → ajouter :
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_R2_PUBLIC_URL`.
5. **Secrets du worker** — dashboard Cloudflare → Workers & Pages → `corbus` →
   Settings → Variables and Secrets → ajouter `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   (et `NEXT_PUBLIC_R2_PUBLIC_URL`).

À partir de là, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
déploie automatiquement à chaque push sur `main`. Aucun identifiant ne transite
ailleurs que dans Cloudflare et GitHub.

### Variante en ligne de commande

Si tu préfères déployer depuis ta machine, remplis `.env.local` puis :

```bash
npx wrangler login          # ouvre le navigateur
bash scripts/setup-cloudflare.sh
```

Le script crée le bucket, envoie les quatre secrets au worker et déploie.

---

## 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dashboard → **SQL Editor** → **New query** → coller tout
   [`supabase/migrations/20260921000000_init.sql`](supabase/migrations/20260921000000_init.sql) → **Run**.
   Le script crée les tables `products` et `site_content`, active RLS et insère
   les 3 produits + la galerie par défaut. Il est ré-exécutable sans risque.
3. Récupérer dans **Project Settings** :
   - `SUPABASE_URL` → Data API → *Project URL*
   - `SUPABASE_SERVICE_ROLE_KEY` → API Keys → *service_role*

> La clé `service_role` contourne RLS. Elle n'est lue que côté serveur et ne
> doit jamais être préfixée `NEXT_PUBLIC_`.

## 2. Bucket R2

```bash
npx wrangler r2 bucket create corbus-media
```

Puis, dans le dashboard Cloudflare → **R2** → `corbus-media` → **Settings** :
exposer le bucket en lecture publique, soit via le domaine `r2.dev` de
développement, soit via un domaine personnalisé (`media.corbus.sn`).
Cette URL publique devient `NEXT_PUBLIC_R2_PUBLIC_URL` (sans slash final).

Le binding lui-même est déclaré dans [`wrangler.jsonc`](wrangler.jsonc) :

```jsonc
"r2_buckets": [{ "binding": "MEDIA", "bucket_name": "corbus-media" }]
```

## 3. Variables d'environnement

Copier [`.env.example`](.env.example) vers `.env.local` pour le développement,
et déclarer les mêmes clés côté Cloudflare
(**Workers & Pages → corbus → Settings → Variables and Secrets**) :

| Variable | Type | Rôle |
| --- | --- | --- |
| `SUPABASE_URL` | Variable | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Accès serveur à la base |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Variable | Domaine public du bucket R2 |
| `ADMIN_PASSWORD` | **Secret** | Mot de passe de `/admin` |
| `ADMIN_SESSION_SECRET` | **Secret** | Signature du cookie de session |

`NEXT_PUBLIC_R2_PUBLIC_URL` est lue **au build** (elle alimente
`images.remotePatterns`) : il faut donc la définir avant de déployer.

Générer le secret de session :

```bash
openssl rand -hex 32
```

## 4. Déployer

```bash
npm install
npm run deploy      # build OpenNext puis publication du worker
```

Autres commandes utiles :

```bash
npm run dev         # Next en local (pas de binding R2 : les uploads renvoient 503)
npm run preview     # worker local avec les bindings R2 réels
npm run cf:build    # build seul, sans publier
npm run typecheck
```

Pour un déploiement continu, connecter le dépôt GitHub dans **Workers & Pages**
avec la commande de build `npm run cf:build` et le répertoire de sortie
`.open-next`.

---

## Notes

**Optimisation d'images.** `images.unoptimized` est activé dans
`next.config.ts` : l'optimiseur Next repose sur `sharp`, indisponible sur le
runtime Workers. Les objets R2 sont servis avec un cache immuable d'un an. Pour
retrouver du redimensionnement, passer par Cloudflare Images et un
[loader personnalisé](https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/).

**Rendu dynamique.** Le layout racine est en `force-dynamic` pour que les
réglages modifiés dans `/admin` soient visibles immédiatement, sans redéploiement.

**Mot de passe admin.** Il n'est plus modifiable depuis l'interface : il vit
dans `ADMIN_PASSWORD`. Pour le changer, modifier le secret dans Cloudflare puis
redéployer.
