#!/bin/bash
# ==============================================
# File:        scripts/deployment/deploy_qverse_core.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     2.0.0
#
# Description:
#   Fast Q-Verse Core Deployment (USDTgVerse Style)
#
#   Uses rsync for fast file sync (like USDTgVerse).
#   No git clone - direct rsync, then build on server.
#   Typically completes in under 1 minute.
#
# License:
#   MIT License
# ==============================================

set -e

# Droplets
NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_USER="root"
# Find SSH Key
if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY="$HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
else
    echo "❌ SSH key not found in ~/.ssh/"
    exit 1
fi

echo "🔑 Using SSH Key: $SSH_KEY"
echo "🚀 Fast Deployment (USDTgVerse Style - rsync based)"
echo ""

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Deploy to Servers
for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deploying to $name ($ip)..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Sync files via rsync (FAST - like USDTgVerse)
    echo "📦 Syncing files via rsync..."
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o BatchMode=yes" \
        --exclude 'target/' \
        --exclude '.git/' \
        --exclude 'node_modules/' \
        --exclude '.next/' \
        --exclude 'qverse.db' \
        --exclude '.env' \
        --exclude '*.log' \
        ./src/ \
        ./Cargo.toml \
        ./Cargo.lock \
        ./scripts/ \
        "$SSH_USER@$ip:/opt/q-verse/" 2>&1 | tail -3 || true
    echo "✅ Files synced"
    
    # 2. Build and restart on server
    echo "🔨 Building and restarting..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 "$SSH_USER@$ip" << 'ENDSSH'
        set -e
        cd /opt/q-verse
        
        # Source cargo
        [ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"
        
        # Build release
        cargo build --release 2>&1 | tail -3
        
        # Install binary
        cp target/release/q-verse-core /usr/local/bin/q-verse-core 2>/dev/null || true
        
        # Restart service
        systemctl daemon-reload
        systemctl restart q-verse-core
        
        # Quick status check
        sleep 2
        if systemctl is-active --quiet q-verse-core; then
            echo "✅ Service restarted successfully"
        else
            echo "⚠️ Service may need attention - check: systemctl status q-verse-core"
        fi
ENDSSH
    
    echo "✅ $name deployment completed!"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All deployments completed!"
echo ""
echo "📋 Verify:"
echo "  curl http://$NYC3_IP:8080/api/health"
echo "  curl http://$SFO2_IP:8080/api/health"
echo "  curl http://$FRA1_IP:8080/api/health"
