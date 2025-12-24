#!/bin/bash
set -e

# NYC3 IP
SERVER="root@159.203.83.98"
DEST="/opt/q-verse"

echo "🚀 Deploying Q-Verse Core to NYC3..."

# 1. Sync Files
echo "📦 Syncing files..."
rsync -avz --progress \
    --exclude 'target' \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    ./src ./Cargo.toml ./Cargo.lock ./scripts \
    $SERVER:$DEST/

# 2. Build & Restart
echo "🔨 Building on server..."
ssh $SERVER "cd $DEST && /root/.cargo/bin/cargo build --release"

echo "🔄 Restarting service..."
ssh $SERVER "systemctl restart q-verse-core && systemctl status q-verse-core --no-pager"

echo "✅ Deployment Complete!"
