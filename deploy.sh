#!/bin/bash
set -e

VPS="ubuntu@141.227.129.238"
REMOTE_DIR="/var/www/ai-trends-news"
LOCAL_DIR="/Users/karimaribi/ai-trends-news"

echo ""
echo "🚀 Déploiement sur le VPS..."
echo ""

# 1. Vérifier que les fichiers src/ sont bien commités (on ignore .claude/)
UNCOMMITTED=$(git -C "$LOCAL_DIR" status --porcelain | grep -v '\.claude' || true)
if [ -n "$UNCOMMITTED" ]; then
  echo "⚠️  Des fichiers non commités existent. Commit d'abord avec git."
  echo "$UNCOMMITTED"
  exit 1
fi

BEHIND=$(git -C "$LOCAL_DIR" log origin/main..HEAD --oneline | wc -l | tr -d ' ')
if [ "$BEHIND" -gt "0" ]; then
  echo "📤 Push des $BEHIND commit(s) vers GitHub..."
  git -C "$LOCAL_DIR" push origin main
fi

# 2. Sync des fichiers sources vers le VPS (excl. node_modules, .next, .git, .env*)
echo "📂 Synchronisation des fichiers..."
rsync -az --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='.claude' \
  --exclude='*.log' \
  "$LOCAL_DIR/" "$VPS:$REMOTE_DIR/"

# 3. Build et restart sur le VPS
echo "🔨 Build en cours sur le VPS..."
ssh "$VPS" "cd $REMOTE_DIR && pnpm install --ignore-scripts 2>&1 | tail -3 && pnpm build 2>&1 | tail -20"

echo "🔄 Redémarrage du serveur..."
ssh "$VPS" "pm2 restart ai-trends-news --update-env"

echo ""
echo "✅ Déploiement terminé — aitrendsnews.com est à jour"
echo ""
