# Changelog — Session BDE LISAA DGC · 16 juin 2026

Résumé exhaustif de toutes les modifications apportées au projet BDE LISAA DGC lors de cette session de travail.

---

## 1. Hero homepage — Layout et typographie

**Fichiers modifiés :** `src/app/[locale]/page.tsx`, `src/app/globals.css`

- Grille hero passée à **`0.65fr 1fr`** pour élargir la colonne droite et que le C de CAMPUS tombe sous le E de MAKE.
- Alignement de "THE" et "CAMPUS" à droite (`text-align: right`) dans la colonne droite.
- Smiley redimensionné proportionnellement à la police (`0.86em`) pour suivre le `clamp` du h1.
- Marges gauche/droite de la homepage : `80px`.

**Commits :** `30afdf7`, `7a1ef0e`, `5135234`, `1d467cd`

---

## 2. Typographies responsives — `clamp()` global

**Fichiers modifiés :** `src/app/[locale]/page.tsx`, `src/app/[locale]/a-propos/page.tsx`, `src/app/[locale]/agenda/page.tsx`, `src/app/[locale]/clubs/page.tsx`, `src/app/[locale]/p/[slug]/page.tsx`, `src/app/[locale]/shop/page.tsx`

- Tous les titres `<h1>` du site passés à **`clamp(72px, 15.5vw, 224px)`** (taille cible : 224px desktop, réduit proportionnellement jusqu'à 72px mobile).
- Padding du wrapper principal rendu responsive via `clamp`.

**Commit :** `fbda090`

---

## 3. Section clubs — Layout mobile

**Fichier modifié :** `src/app/[locale]/page.tsx`

- La section "NOS CLUBS JUSTE POUR VOUS" sur mobile reproduit le même layout que le desktop mais avec des tailles réduites via `clamp()`.
- Même structure de blocs chevron, sans colonne latérale repliée.

**Commit :** `bbe4d39`

---

## 4. Menu navbar — Traductions anglaises

**Fichier modifié :** `src/components/NavbarClient.tsx`

- Ajout d'un champ `labelEn` sur chaque item du tableau `NAV_ITEMS`.
- En locale `/en`, le menu affiche les libellés traduits :
  - AGENDA & EVENTS
  - OUR CLUBS
  - SHOP
  - ABOUT US

**Commit :** `234fc48`

---

## 5. Footer — Restructuration initiale

**Fichier modifié :** `src/components/SiteFooter.tsx`

- Suppression de "COUP DE CŒUR" du menu de navigation.
- Navigation réorganisée en **2×2 colonnes** :
  - Col 1 : AGENDA & EVENTS · NOS CLUBS
  - Col 2 : SHOP · À PROPOS
- Pages légales affichées sur **une seule ligne** (`flexDirection: 'row', flexWrap: 'wrap'`).
- Titre de section agenda renommé : `& EVENT` → **`& EVENTS`**.

**Commits :** `234fc48`, `e42e369`

---

## 6. Dark mode — Mise en place initiale

**Fichiers modifiés :** `src/app/globals.css`, `src/components/SiteFooter.tsx`, `src/app/layout.tsx`

- Script anti-flash ajouté dans `layout.tsx` pour lire `localStorage('bde-dark')` avant hydration et appliquer la classe `html.dark`.
- CSS variables swappées en dark mode : `--yellow → #5FA0FB` (bleu), `--blue-strong → #FEEF4C` (jaune).
- Corrections visuelles dark mode (première passe) :
  - Quadrillage agenda → `filter: invert(1)` (classe `quadrillage-img`)
  - Étoiles décoratives → `filter: hue-rotate(180deg)` (classe `deco-star-img`)
  - Smileys → `filter: invert(1)` (classe `smiley-img`)
  - Textes des cards événements → fond blanc + texte noir forcés (classe `event-card-body`)

**Commit :** `50fc8f1`

---

## 7. Support anglais — Pages statiques (CGU, CGV, Mentions légales…)

**Fichiers modifiés :** `src/lib/types.ts`, `src/components/PageEditor.tsx`, `src/app/[locale]/p/[slug]/page.tsx`

### `types.ts`
- Ajout de `title_en: string | null` et `content_en: string | null` à l'interface `Page`.

### `PageEditor.tsx` (refonte complète)
- Ajout d'onglets **🇫🇷 Français / 🇬🇧 English** dans l'éditeur admin.
- Onglet FR : titre, slug, éditeur Tiptap existant.
- Onglet EN : champ `title_en` + second éditeur Tiptap indépendant (`content_en`).
- Les deux champs sont inclus dans le payload de sauvegarde Supabase.
- Suppression de l'encart "Migration SQL requise" (migration déjà appliquée).
- Correction d'un bug TypeScript : `borderBottom` déclaré deux fois dans le même objet de style (bloquait le build Vercel).

### `p/[slug]/page.tsx`
- Affiche `title_en` / `content_en` quand `locale === 'en'`, avec fallback FR si le champ est vide.
- `generateMetadata` mis à jour pour retourner le bon titre selon la locale.
- Texte "Contenu à venir." traduit en "Content coming soon." en EN.

### Migration SQL appliquée dans Supabase
```sql
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT;
```

**Commit :** `abab610`

---

## 8. Section "NOS CLUBS JUSTE POUR VOUS" — Couleurs par slug

**Fichier modifié :** `src/app/[locale]/page.tsx`

- Couleurs de fond des clubs **fixées par slug** (robuste quelle que soit l'ordre en DB) :
  - `typo` → `#FF5500` / texte `#262626` (noir)
  - `photo` → `#5FA0FB` / texte `#262626` (noir)
  - `print` → `#FF88E8` / texte `#262626` (noir)
- Tous les textes des clubs (titre, dates, tagline) en noir — y compris CLUB PRINT qui était blanc.
- Fonction `applyClubColor(club)` qui matche par `slug.includes(key)` ou `title.includes(key)`.

**Commits :** `abab610`, `11ccd5b`, `3d3a63a`

---

## 9. Flèche mobile — Section événements

**Fichier modifié :** `src/app/[locale]/page.tsx`

- En mobile, le bouton texte "VOIR TOUS LES ÉVÉNEMENTS" est remplacé par une flèche SVG (`flechedroite.svg`, `viewBox="0 0 58 58"`).
- Couleur : `fill="var(--yellow)"` → jaune en light mode, bleu (`#5FA0FB`) automatiquement en dark mode.
- Taille : `44×44px`.

**Commit :** `abab610`

---

## 10. Badges noms — Membres de l'équipe

**Fichiers modifiés :** `src/app/[locale]/a-propos/page.tsx`, `src/app/[locale]/page.tsx`

- Tableau de rotations `[-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2]` appliqué cycliquement par index.
- Chaque badge a une rotation différente : `transform: rotate(${rot}deg)`.
- Appliqué sur la page **À propos** ET sur la section team de la **homepage**.

**Commits :** `abab610`, `11ccd5b`

---

## 11. Dark mode — Persistance

**Fichiers modifiés :** `src/components/SiteFooter.tsx`, `src/app/layout.tsx`

### Bug résolu : race condition entre deux `useEffect`
- Le second `useEffect` (sync) s'exécutait au mount avec `dark = false` et écrasait le localStorage avant que le premier effect (lecture) ait eu le temps de mettre à jour l'état.
- **Fix :** `useState` avec lazy initializer qui lit localStorage dès l'initialisation du composant :
  ```tsx
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem('bde-dark') === '1' } catch { return false }
  })
  ```
- Un seul `useEffect` de synchronisation subsiste.

**Commit :** `a880cb8`

---

## 12. Dark mode — Corrections visuelles (deuxième passe)

**Fichiers modifiés :** `src/app/globals.css`, `src/components/SiteFooter.tsx`, `src/app/[locale]/shop/page.tsx`, `src/components/CartBubble.tsx`, `src/components/CartDrawer.tsx`

| Élément | Correction |
|---|---|
| Toggle FR/EN | Reste bleu `#5FA0FB` en dark (`.nav-panel__locale-toggle`) |
| Labels shop "best of…" | `background: #5FA0FB` en dark (classe `shop-label-badge`) |
| Produits shop | Fond blanc + texte noir (classe `shop-product-card`) |
| CartDrawer | Fond clair + texte noir (classe `cart-drawer-inner` renforcée) |
| CartBubble fond | `#262626` hardcodé (au lieu de `var(--ink)` qui devenait blanc) |
| CartBubble badge jaune | Chiffre `#262626` hardcodé |
| Entoure.svg footer | `filter: invert(1)` (classe `footer-entoure`) |
| Crédits footer | Texte + bordures blancs en dark (classe `footer-credit`) |

**Commits :** `aa153b4`, `4c69065`, `9babb06`, `38cf15b`

---

## 13. Footer — Traductions EN des pages légales

**Fichier modifié :** `src/components/SiteFooter.tsx`

- Select Supabase étendu à `title, title_en, slug`.
- État `extraPages` typé avec `title_en: string | null`.
- Affichage : `(isEn && p.title_en ? p.title_en : p.title).toUpperCase()`.
- Les pages CGU / CGV / Mentions légales s'affichent en anglais en version `/en` si `title_en` est renseigné dans l'admin.

**Commit :** `3d3a63a`

---

## 14. Footer — Bouton back-to-top

**Fichiers modifiés :** `src/components/SiteFooter.tsx`, `public/images/flecheverslehaut.svg`

- Le bouton cercle générique remplacé par l'image `flecheverslehaut.svg` (fourni par le designer).
- Copié dans `public/images/` et référencé via `<img>` cliquable.

**Commit :** `aa153b4`

---

## 15. Menu actif — Couleur rouge

**Fichier modifié :** `src/app/globals.css`

- Items de navigation actifs en rouge `#FF5500` (desktop + panel mobile).
```css
.main-nav a.is-active { background: #FF5500; color: #fff; }
.nav-panel__links a.active { background: #FF5500; color: #fff; }
```

**Commit :** `6aaf757`

---

## 16. Bannière cookies — Internationalisation

**Fichier modifié :** `src/components/CookieBanner.tsx`

- Détection locale via `usePathname().startsWith('/en')`.
- Texte EN : "We use cookies to measure our site's audience and improve your experience."
- Lien EN vers `/en/p/privacy-policy`, lien FR vers `/fr/p/politique-confidentialite`.
- Boutons : "Accept" / "Decline" en EN, "Accepter" / "Refuser" en FR.

**Commit :** `6aaf757`

---

## 17. Agenda — Jours de la semaine en anglais

**Fichier modifié :** `src/components/AgendaCalendarClient.tsx`

- Import de `enUS` depuis `date-fns/locale`.
- `dateFnsLocale = isEn ? enUS : fr` pour le label du mois.
- `WEEKDAYS = isEn ? ['mon','tue','wed','thu','fri','sat','sun'] : ['lun','mar','mer','jeu','ven','sam','dim']`.

**Commit :** `6aaf757`

---

## 18. Pages statiques — Taille de titre réduite

**Fichier modifié :** `src/app/[locale]/p/[slug]/page.tsx`

- Taille de police du titre divisée par 2 :
  - Avant : `clamp(72px, 15.5vw, 224px)`
  - Après : `clamp(36px, 7.75vw, 112px)`

**Commit :** `6aaf757`

---

## 19. Panier — Badge count sur l'icône header

**Fichiers modifiés :** `src/components/NavbarClient.tsx`, `src/app/[locale]/layout.tsx`, `src/components/CartContext.tsx`

- Import de `useCart` dans `NavbarClient`.
- Badge jaune `#FFE74A` / chiffre noir `#262626` affiché sur l'icône panier si `cartCount > 0`.
- `CartProvider` monté dans `[locale]/layout.tsx` pour couvrir toutes les pages (et non plus seulement `/shop`).
- `useCart()` retourne `EMPTY_CART` au lieu de `throw` quand utilisé hors provider.

**Commits :** `898b54e`, `21757ff`

---

## 20. Dashboard admin — Lien contact développeur

**Fichier modifié :** `src/app/admin/(protected)/page.tsx`

- Bandeau en bas du dashboard : "Vous rencontrez un problème ou un bug ? Contactez le développeur"
- Lien `mailto:karimaribi@gmail.com?subject=Ticket%20Site%20BDE`
- Objet email prérempli : "Ticket Site BDE"

**Commits :** `a068b60`, `3f1e2ef`

---

## 21. Corrections de build et erreurs techniques

### Erreur TypeScript — `PageEditor.tsx`
- `borderBottom` déclaré deux fois dans le même objet literal → suppression du doublon.
- Bloquait le build Vercel depuis 9h30.

**Commit :** `6aa262b`

### Erreurs console Next.js 16 — `layout.tsx`
- `<script dangerouslySetInnerHTML>` dans `<head>` → maintenu (valide en Server Component).
- `<Script>` next/script hors de `<html>/<head>/<body>` → déplacé dans `<body>`.
- Structure finale :
  ```tsx
  <head>
    <script dangerouslySetInnerHTML={{ __html: `...dark mode init...` }} />
  </head>
  <body>
    ...
    <Script id="typekit-init" strategy="afterInteractive">...</Script>
  </body>
  ```

**Commit :** `d9120ac`

---

## Récapitulatif des commits (ordre chronologique)

| Hash | Message |
|---|---|
| `fbda090` | style: titres de page à 224px sur toutes les pages |
| `5135234` | fix: smiley hero homepage proportionnel au font 224px (0.86em) |
| `7a1ef0e` | fix: hero homepage — THE et CAMPUS alignés à droite |
| `1d467cd` | style: homepage — marges gauche/droite à 80px |
| `30afdf7` | fix: hero homepage — colonne droite élargie pour CAMPUS (0.65fr 1fr) |
| `bbe4d39` | style: responsive titles (clamp) + clubs section mobile layout |
| `234fc48` | fix: menu EN traduction + suppression coup de coeur + agenda & events |
| `e42e369` | style: footer — menu 2x2 colonnes, pages légales sur une ligne |
| `50fc8f1` | fix: dark mode — persistance, quadrillage, étoiles, smiley, cards |
| `abab610` | feat: EN support pages statiques, rotations badges, couleurs clubs, flèche mobile |
| `11ccd5b` | fix: badge rotations homepage, club PRINT text color by slug |
| `3d3a63a` | fix: textes clubs tous noirs, pages légales EN dans le footer |
| `6aaf757` | feat: menu actif rouge, titre pages /2, agenda EN, cookie banner EN |
| `a880cb8` | fix: dark mode persistant — lazy init useState |
| `a068b60` | feat: lien contact développeur dans le dashboard admin |
| `aa153b4` | feat: dark mode shop/cart/footer + bouton back-to-top SVG |
| `6aa262b` | fix: suppression borderBottom dupliqué dans PageEditor |
| `3f1e2ef` | fix: objet email prérempli "Ticket Site BDE" |
| `4c69065` | fix: CartBubble fond forcé #262626 en dark mode |
| `9babb06` | fix: badge jaune CartBubble chiffre forcé #262626 |
| `898b54e` | feat: badge count panier sur l'icône header navbar |
| `21757ff` | fix: script tags Next.js 16 + badge panier navbar + CartProvider global |
| `d9120ac` | fix: script placement layout.tsx — dark-mode dans `<head>`, typekit dans `<body>` |
| `38cf15b` | fix: footer crédits blanc + bordures blanches en dark mode |

---

*Généré le 16 juin 2026 — Projet BDE LISAA DGC (Next.js 16 + Supabase)*
