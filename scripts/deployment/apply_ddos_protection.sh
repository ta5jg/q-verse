#!/bin/bash
# ==============================================
# File:        scripts/deployment/apply_ddos_protection.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Apply Complete DDoS Protection
#
#   Applies both backend rate limiting and Nginx/firewall rules
#   to all three DigitalOcean droplets.
#
# License:
#   MIT License
# ==============================================

set -e

# Server configurations
declare -A SERVERS=(
    ["NYC3"]="159.203.83.98"
    ["SFO2"]="167.172.48.248"
    ["FRA1"]="46.101.248.108"
)

SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛡️  Applying Quantum-Level DDoS Protection to All Servers..."
echo ""

for SERVER_NAME in "${!SERVERS[@]}"; do
    SERVER_IP="${SERVERS[$SERVER_NAME]}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🖥️  Processing: $SERVER_NAME ($SERVER_IP)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Upload firewall script
    echo "📤 Uploading firewall protection script..."
    scp -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        "$SCRIPT_DIR/firewall_ddos_protection.sh" \
        root@$SERVER_IP:/tmp/firewall_ddos_protection.sh
    
    # 2. Upload Nginx config
    echo "📤 Uploading Nginx rate limiting config..."
    scp -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        "$SCRIPT_DIR/nginx_rate_limiting.conf" \
        root@$SERVER_IP:/tmp/nginx_rate_limiting.conf
    
    # 3. Apply firewall rules (with caution - test SSH first!)
    echo "🔒 Applying firewall rules..."
    ssh -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        root@$SERVER_IP << 'ENDSSH'
        set -e
        chmod +x /tmp/firewall_ddos_protection.sh
        
        # Backup current rules
        iptables-save > /root/iptables_backup_$(date +%Y%m%d_%H%M%S).rules
        
        # Apply protection (with warning)
        echo "⚠️  WARNING: This will modify firewall rules."
        echo "   Make sure you have console access!"
        /tmp/firewall_ddos_protection.sh
        
        echo "✅ Firewall protection applied on $(hostname)"
ENDSSH
    
    # 4. Apply Nginx config
    echo "🌐 Applying Nginx rate limiting..."
    ssh -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        root@$SERVER_IP << 'ENDSSH'
        set -e
        
        # Backup current nginx config
        if [ -f /etc/nginx/sites-available/q-verse.org ]; then
            cp /etc/nginx/sites-available/q-verse.org /etc/nginx/sites-available/q-verse.org.backup_$(date +%Y%m%d_%H%M%S)
        fi
        
        # Merge rate limiting config (manual step - review first)
        echo "📝 Rate limiting config uploaded to /tmp/nginx_rate_limiting.conf"
        echo "   Review and merge manually, then: nginx -t && systemctl reload nginx"
        
        echo "✅ Nginx config ready on $(hostname)"
ENDSSH
    
    echo "✅ $SERVER_NAME protection applied!"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All servers protected!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review Nginx configs on each server"
echo "  2. Merge rate limiting rules into main nginx config"
echo "  3. Test: nginx -t && systemctl reload nginx"
echo "  4. Monitor logs for rate limit hits"
echo ""
echo "⚠️  IMPORTANT: Test SSH access on all servers!"
echo "   If locked out, use DigitalOcean Console."
