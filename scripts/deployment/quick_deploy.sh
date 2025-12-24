#!/bin/bash
# ==============================================
# File:        scripts/deployment/quick_deploy.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Quick Deployment Script - Fire and Forget
#
#   Uploads and starts deployment on all servers without waiting.
#   All operations run in background.
#
# License:
#   MIT License
# ==============================================

set -e

NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
if [ ! -f "$SSH_KEY" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
fi

echo "🚀 Quick Deployment - Fire and Forget Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Upload script to all servers in parallel
echo "📤 Uploading deployment script..."
(
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes \
        scripts/deployment/remote_install.sh root@$NYC3_IP:/tmp/deploy.sh 2>&1 | grep -v "Warning" &
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes \
        scripts/deployment/remote_install.sh root@$SFO2_IP:/tmp/deploy.sh 2>&1 | grep -v "Warning" &
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes \
        scripts/deployment/remote_install.sh root@$FRA1_IP:/tmp/deploy.sh 2>&1 | grep -v "Warning" &
    wait
) && echo "✅ Scripts uploaded" || echo "⚠️ Some uploads may have failed"

echo ""
echo "🚀 Starting deployment on all servers..."
echo ""

# Start deployment on all servers in parallel
(
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes root@$NYC3_IP \
        "chmod +x /tmp/deploy.sh && nohup /tmp/deploy.sh > /var/log/qverse_deploy.log 2>&1 &" 2>&1 | grep -v "Warning" &
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes root@$SFO2_IP \
        "chmod +x /tmp/deploy.sh && nohup /tmp/deploy.sh > /var/log/qverse_deploy.log 2>&1 &" 2>&1 | grep -v "Warning" &
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes root@$FRA1_IP \
        "chmod +x /tmp/deploy.sh && nohup /tmp/deploy.sh > /var/log/qverse_deploy.log 2>&1 &" 2>&1 | grep -v "Warning" &
    wait
) && echo "✅ Deployment started on all servers" || echo "⚠️ Some deployments may have failed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment initiated!"
echo ""
echo "📋 Monitor Progress:"
echo "  ssh root@$NYC3_IP 'tail -f /var/log/qverse_deploy.log'"
echo "  ssh root@$SFO2_IP 'tail -f /var/log/qverse_deploy.log'"
echo "  ssh root@$FRA1_IP 'tail -f /var/log/qverse_deploy.log'"
echo ""
echo "⏱️  Build typically takes 5-10 minutes per server."
echo "   Check status: bash scripts/deployment/check_deployment_status.sh"
