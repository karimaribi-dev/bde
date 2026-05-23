# AI Trends News — Documentation opérationnelle

> Dernière mise à jour : mai 2026

---

## Table des matières

1. [Architecture globale](#1-architecture-globale)
2. [Stack technique](#2-stack-technique)
3. [Démarrer le serveur de développement](#3-démarrer-le-serveur-de-développement)
4. [Démarrer Ollama (modèle IA local)](#4-démarrer-ollama-modèle-ia-local)
5. [Démarrer Docker (n8n + services)](#5-démarrer-docker-n8n--services)
6. [Importer et activer le workflow n8n](#6-importer-et-activer-le-workflow-n8n)
7. [Déclencher manuellement le workflow](#7-déclencher-manuellement-le-workflow)
8. [Déployer en production](#8-déployer-en-production)
9. [Administration du site](#9-administration-du-site)
10. [Supabase — base de données](#10-supabase--base-de-données)
11. [Résolution des problèmes courants](#11-résolution-des-problèmes-courants)

---

## 1. Architecture globale

```
┌─────────────────────────────────────────────────────────┐
│  MacBook (local)                                         │
│                                                          │
│  ┌──────────────┐    ┌────────────────────────────────┐  │
│  │   Ollama     │    │  Docker                        │  │
│  │  qwen2.5:14b │◄───│  ├── n8n          :5678       │  │
│  │  :11434      │    │  ├── PostgreSQL   :5432       │  │
│  └──────────────┘    │  ├── Open WebUI  :3000       │  │
│                       │  └── Qdrant      :6333       │  │
│                       └────────────────────────────────┘  │
│                                  │                        │
│                                  │ workflow automatisé    │
│                                  ▼                        │
│                       ┌────────────────────┐             │
│                       │  Supabase (cloud)  │             │
│                       │  base de données   │             │
│                       └────────────────────┘             │
└─────────────────────────────────────────────────────────┘
                                  │
                         déploiement SSH
                                  │
┌─────────────────────────────────▼───────────────────────┐
│  VPS (141.227.129.238)                                   │
│  ├── Next.js (PM2)   → aitrendsnews.com                  │
│  └── Nginx (reverse proxy, SSL)                          │
└─────────────────────────────────────────────────────────┘
```

**Flux de production d'articles :**
```
RSS Feeds (25 sources) → n8n → Qwen (clustering) → Qwen (rédaction) → Supabase → Site public
```

---

## 2. Stack technique

| Composant | Technologie | Version |
|---|---|---|
| Framework web | Next.js | 16 |
| Language | TypeScript | — |
| CSS | Tailwind v4 + CSS custom | — |
| Base de données | Supabase (PostgreSQL) | — |
| Authentification | Supabase Auth | — |
| i18n | next-intl | v4 |
| Éditeur | TipTap | v3 |
| Orchestration | n8n | latest |
| LLM local | Ollama + qwen2.5:14b | — |
| Runtime conteneurs | Docker | — |
| Gestionnaire de paquets | pnpm | — |
| Serveur prod | PM2 + Nginx | — |
| VPS | Ubuntu 22.04 | 141.227.129.238 |

---

## 3. Démarrer le serveur de développement

Le site tourne sur le **port 3004** en local.

```bash
# Depuis le dossier du projet
cd /Users/karimaribi/ai-trends-news

# Installer les dépendances (première fois ou après un pull)
pnpm install

# Lancer le serveur de développement
pnpm dev
```

➜ Site accessible sur **http://localhost:3004**  
➜ Admin accessible sur **http://localhost:3004/admin**

> **Variables d'environnement requises** : le fichier `.env.local` doit être présent avec les clés Supabase. Il n'est pas committé en git.

```env
# .env.local (ne jamais committer)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 4. Démarrer Ollama (modèle IA local)

Ollama doit tourner sur **toutes les interfaces réseau** (`0.0.0.0`) pour être accessible depuis Docker via `host.docker.internal`.

### Première configuration (une seule fois)

```bash
# Configurer Ollama pour écouter sur 0.0.0.0 (pas seulement 127.0.0.1)
launchctl setenv OLLAMA_HOST "0.0.0.0"

# Redémarrer Ollama
brew services restart ollama
# ou : pkill ollama && ollama serve &
```

### Lancement normal

```bash
# Démarrer Ollama (si pas déjà en route via brew services)
ollama serve

# Vérifier que le modèle qwen2.5:14b est disponible
ollama list

# Télécharger le modèle si absent (14 Go, à faire une seule fois)
ollama pull qwen2.5:14b
```

### Vérification

```bash
# Test direct de l'API Ollama
curl http://localhost:11434/api/tags

# Test depuis Docker (simule n8n)
curl http://host.docker.internal:11434/api/tags
```

> **Important** : si Ollama ne répond pas depuis Docker, relancer avec `launchctl setenv OLLAMA_HOST "0.0.0.0"` puis redémarrer le service.

---

## 5. Démarrer Docker (n8n + services)

Tous les services Docker sont définis dans `/Users/karimaribi/PROJET2026/docker-compose.yml`.

```bash
cd /Users/karimaribi/PROJET2026

# Démarrer tous les services en arrière-plan
make docker-up
# équivalent : docker-compose up -d

# Arrêter tous les services
make docker-down
# équivalent : docker-compose down
```

### Services disponibles après démarrage

| Service | URL | Identifiants |
|---|---|---|
| **n8n** (workflows) | http://localhost:5678 | `admin` / mot de passe dans `.env` |
| **Open WebUI** (Ollama UI) | http://localhost:3000 | compte créé à la première connexion |
| **Qdrant** (vector DB) | http://localhost:6333 | API key dans `.env` |
| **PostgreSQL** (base n8n) | localhost:5432 | `n8n` / `n8n_secure_password` |

### Vérifier que les services tournent

```bash
docker ps
# ou
docker-compose ps
```

### Voir les logs d'un service

```bash
docker-compose logs -f n8n        # logs n8n en temps réel
docker-compose logs -f postgres   # logs base de données
```

---

## 6. Importer et activer le workflow n8n

Le workflow principal est : `/Users/karimaribi/PROJET2026/workflows/workflow-unified.json`

**Nom** : `RSS Unified — FR/EN/ES/DE (Qwen 4 langues)`

### Import via l'interface n8n

1. Ouvrir **http://localhost:5678**
2. Menu gauche → **Workflows** → bouton **Import**
3. Sélectionner le fichier `workflow-unified.json`
4. Cliquer **Save** puis activer le toggle en haut à droite (**Active**)

### Structure du workflow (10 nœuds)

```
Schedule Trigger
      │
      ▼
Select RSS Feeds        ← 25 sources RSS (tech, IA, presse FR/DE/ES)
      │
      ▼
Fetch RSS Feed          ← HTTP GET sur chaque flux (continueOnFail: true)
      │
      ▼
Parse RSS Items         ← Gère RSS <item> ET Atom <entry>
      │
      ▼
Aggregate Articles      ← Regroupe tous les items en une liste
      │
      ▼
Qwen Cluster Analysis   ← Ollama : regroupe les articles par sujet (2 clusters)
      │
      ▼
Parse Clusters          ← Extrait les clusters JSON de la réponse Qwen
      │
      ▼
Qwen Write Article      ← Ollama : rédige l'article en FR/EN/ES/DE
      │
      ▼
Format Article          ← Prépare le payload Supabase (slug, locale, métadonnées)
      │
      ▼
Save All Locales        ← INSERT dans Supabase (4 lignes par cluster : fr/en/es/de)
```

### Planning automatique

Le workflow se déclenche automatiquement selon le Schedule Trigger configuré dans n8n (à vérifier/modifier dans l'interface).

---

## 7. Déclencher manuellement le workflow

### Via l'interface n8n

1. Ouvrir **http://localhost:5678**
2. Ouvrir le workflow `RSS Unified — FR/EN/ES/DE`
3. Cliquer **Execute workflow** (bouton ▶ en haut à droite)
4. Surveiller l'exécution nœud par nœud dans l'interface

### Vérifier les résultats

Après exécution, les articles apparaissent dans :
- **Supabase** → table `articles` (4 lignes par cluster, une par langue)
- **Site** → http://localhost:3004 (ou aitrendsnews.com en production)
- **Admin** → http://localhost:3004/admin/articles

### Ce que produit une exécution

- **2 clusters** analysés par run (réduit de 3 pour éviter les OOM)
- **4 articles** créés par cluster (fr / en / es / de)
- **8 articles** au total par exécution
- Slugs générés sous la forme : `fr-titre-article`, `en-article-title`, etc.

---

## 8. Déployer en production

```bash
cd /Users/karimaribi/ai-trends-news

# Méthode 1 : script dédié
bash deploy.sh

# Méthode 2 : via pnpm
pnpm deploy
```

### Ce que fait le script `deploy.sh`

1. Vérifie que tous les fichiers sont commités (sinon bloque)
2. Push les commits en attente vers GitHub
3. `rsync` les sources vers le VPS (exclut `node_modules`, `.next`, `.env`)
4. Sur le VPS : `pnpm install` + `pnpm build`
5. Redémarre l'application via **PM2**

### Accès SSH direct au VPS

```bash
ssh ubuntu@141.227.129.238

# Sur le VPS — commandes utiles
pm2 list                          # état du serveur Next.js
pm2 logs ai-trends-news           # logs en temps réel
pm2 restart ai-trends-news        # redémarrer manuellement
pm2 stop ai-trends-news           # arrêter

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Redémarrage d'urgence du VPS

```bash
ssh ubuntu@141.227.129.238 "pm2 restart ai-trends-news"
```

---

## 9. Administration du site

### Accès

| Environnement | URL Admin |
|---|---|
| Développement | http://localhost:3004/admin |
| Production | https://aitrendsnews.com/admin |

### Pages d'administration

| Page | Description |
|---|---|
| `/admin` | Dashboard — statistiques générales |
| `/admin/articles` | Liste des articles (avec flag langue 🇫🇷🇬🇧🇪🇸🇩🇪) |
| `/admin/articles/new` | Créer un article manuellement |
| `/admin/categories` | Gérer les catégories |
| `/admin/analytics` | Configurer GTM (GTM-xxx) et GA4 (G-xxx) |
| `/admin/social` | Liens réseaux sociaux |
| `/admin/newsletter` | Gestion newsletter |
| `/admin/pages` | Pages statiques (CGU, contact…) |
| `/admin/popups` | Popups d'annonce |
| `/admin/maintenance` | Mode maintenance |

### Créer un article manuellement

1. Aller sur `/admin/articles/new`
2. Remplir : titre, contenu (éditeur TipTap), extrait, catégorie
3. **Important** : sélectionner la **langue** (FR/EN/ES/DE) dans la sidebar droite
4. Cliquer **Publier**

> Le champ langue détermine sur quelle version du site l'article apparaît. Un article sans langue définie n'apparaît nulle part.

---

## 10. Supabase — base de données

### Tables principales

| Table | Contenu |
|---|---|
| `articles` | Tous les articles (4 par cluster : fr/en/es/de) |
| `categories` | Catégories avec noms traduits (fr/en/es/de) |
| `site_settings` | Paramètres : analytics, maintenance, popup, social |
| `pages` | Pages statiques |
| `newsletters` | Campagnes newsletter |
| `subscribers` | Abonnés newsletter |

### Structure d'un article

```sql
id          uuid
title       text
slug        text        -- format : "fr-titre-article"
locale      text        -- 'fr' | 'en' | 'es' | 'de'
content     text        -- HTML (généré par Qwen via TipTap)
excerpt     text
category_id uuid
published   boolean
created_at  timestamptz
```

### Pourquoi 4 lignes par article ?

Le workflow crée **une ligne par langue** pour chaque sujet traité. C'est intentionnel :
- Chaque ligne a son propre `slug`, `title`, `content` dans la bonne langue
- Les requêtes filtrent par `locale` pour afficher la bonne version
- Pas de duplication d'images (ComfyUI retiré du workflow)
- 8 articles/run × 365 jours = ~2 900 articles/an max → négligeable pour PostgreSQL

---

## 11. Résolution des problèmes courants

### Le site ne démarre pas en local

```bash
# Vérifier les variables d'environnement
cat .env.local

# Réinstaller les dépendances
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Ollama non accessible depuis Docker

```bash
# Vérifier sur quelle adresse Ollama écoute
curl http://localhost:11434/api/tags          # doit répondre
curl http://host.docker.internal:11434/api/tags  # doit aussi répondre

# Si ça ne marche pas depuis Docker :
launchctl setenv OLLAMA_HOST "0.0.0.0"
brew services restart ollama
# puis redémarrer Docker Desktop
```

### Erreur "model '' not found" dans n8n

Le nœud HTTP utilise un mauvais `Content-Type`. Vérifier dans les nœuds `Qwen Cluster Analysis` et `Qwen Write Article` :
- **Body Content Type** : `Raw`
- **Content Type** : `application/json`
- **Header** : `Content-Type: application/json` (ajouté manuellement)

### Articles en FR ne s'affichent pas

1. Vérifier dans l'admin que l'article a bien `locale = 'fr'`
2. Si `locale = null` → éditer l'article et sélectionner FR dans la sidebar
3. Vérifier dans Supabase : `SELECT * FROM articles WHERE locale = 'fr' LIMIT 5`

### Le bouton de langue FR ne fonctionne pas

- Le switcher de locale utilise `window.location.href` (pas `router.push`)
- `localeDetection: false` est configuré dans `src/i18n/routing.ts` — ne pas changer
- Le cookie `locale_choice` mémorise le choix de l'utilisateur (durée : 1 an)

### Déploiement bloqué ("fichiers non commités")

```bash
git add -A
git commit -m "fix: description du changement"
bash deploy.sh
```

### PM2 crash en boucle sur le VPS

```bash
ssh ubuntu@141.227.129.238
pm2 logs ai-trends-news --lines 50   # voir l'erreur
# Souvent : variable d'environnement manquante
# Vérifier : /var/www/ai-trends-news/.env.local
pm2 restart ai-trends-news --update-env
```

### n8n "Save All Locales" échoue

Causes fréquentes :
- **"json not object"** → vérifier que le nœud est `runOnceForAllItems`
- **401 Unauthorized** → vérifier les clés Supabase dans les credentials n8n
- **Timeout** → Qwen met trop de temps, augmenter `N8N_RUNNERS_TASK_TIMEOUT` dans docker-compose

---

## Checklist démarrage complet

Pour lancer l'environnement complet de développement + génération d'articles :

```bash
# 1. Ollama (modèle IA)
brew services start ollama
# vérifier : curl http://localhost:11434/api/tags

# 2. Docker (n8n + services)
cd /Users/karimaribi/PROJET2026
make docker-up
# attendre ~30s que n8n démarre

# 3. Site Next.js
cd /Users/karimaribi/ai-trends-news
pnpm dev
# accessible sur http://localhost:3004

# 4. Workflow (si besoin de générer des articles)
# → http://localhost:5678 → workflow RSS Unified → ▶ Execute
```
