#!/bin/bash
# ==============================================
# File:        scripts/deployment/check_deployment_status.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Check Deployment Status on All Servers
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

echo "📊 Checking Deployment Status on All Servers..."
echo ""

for server_info in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r SERVER_NAME SERVER_IP <<< "$server_info"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🖥️  $SERVER_NAME ($SERVER_IP)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    ssh -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o BatchMode=yes \
        -o ConnectTimeout=10 \
        root@$SERVER_IP << 'ENDSSH' 2>/dev/null || echo "❌ Connection failed"
        echo "📋 Service Status:"
        systemctl status q-verse-core --no-pager -l | head -10 || echo "   Service not found"
        
        echo ""
        echo "📝 Deployment Log (last 20 lines):"
        tail -20 /var/log/qverse_deploy.log 2>/dev/null || echo "   Log file not found"
        
        echo ""
        echo "🔍 Process Check:"
        ps aux | grep -E "q-verse-core|deploy.sh" | grep -v grep || echo "   No processes found"
        
        echo ""
        echo "🌐 Port Check:"
        netstat -tlnp 2>/dev/null | grep -E ":8080|:3000" || ss -tlnp 2>/dev/null | grep -E ":8080|:3000" || echo "   Ports not listening"
ENDSSH
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Status check complete!"
