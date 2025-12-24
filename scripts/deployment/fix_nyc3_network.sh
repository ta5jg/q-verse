#!/bin/bash
# ==============================================
# File:        scripts/deployment/fix_nyc3_network.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Fix NYC3 Network Issues
#
#   NYC3 has outbound network restrictions from DDoS protection.
#   This script uses rsync/scp to deploy instead of git clone.
#
# License:
#   MIT License
# ==============================================

set -e

NYC3_IP="159.203.83.98"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
if [ ! -f "$SSH_KEY" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
fi

echo "🔧 Fixing NYC3 Deployment (Network Issues)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean up old deployment processes
echo "🧹 Cleaning up old deployment processes..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$NYC3_IP \
    "pkill -f 'deploy.sh\|cargo build\|git clone' 2>/dev/null || true; sleep 2"

# Upload code via rsync (works even with outbound restrictions)
echo "📤 Uploading code via rsync (bypasses git clone)..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude 'target/' \
    --exclude '.git/' \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    /Users/irfangedik/Q-Verse/ root@$NYC3_IP:/opt/q-verse/ 2>&1 | grep -E "sent|total|error" | head -5

# Build and restart
echo ""
echo "🔨 Building and restarting service..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@$NYC3_IP << 'ENDSSH'
    cd /opt/q-verse
    
    # Source cargo if needed
    [ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"
    
    echo "🔧 Building release..."
    cargo build --release 2>&1 | tail -5
    
    echo ""
    echo "🚀 Restarting service..."
    cp target/release/q-verse-core /usr/local/bin/q-verse-core
    systemctl daemon-reload
    systemctl restart q-verse-core
    
    sleep 3
    systemctl status q-verse-core --no-pager -l | head -10
ENDSSH

echo ""
echo "✅ NYC3 deployment completed!"
