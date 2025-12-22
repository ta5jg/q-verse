#!/bin/bash
set -e

NYC3_IP="159.203.83.98"
SSH_USER="root"

if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY="$HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
else
    echo "❌ SSH key not found"
    exit 1
fi

echo "🔍 Detailed Check for NYC3 (159.203.83.98)"
echo "============================================"
echo ""

# Try multiple connection methods
echo "1. Testing SSH connection..."
if ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SSH_USER@$NYC3_IP" echo "OK" 2>&1; then
    echo "✅ Connection successful!"
    echo ""
    
    echo "2. Checking if outbound traffic is blocked..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$NYC3_IP" bash <<'REMOTE_CHECK'
        echo "Testing outbound connectivity..."
        timeout 3 curl -s https://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTPS works" || echo "❌ Outbound HTTPS blocked"
        timeout 3 curl -s http://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTP works" || echo "❌ Outbound HTTP blocked"
        timeout 3 nslookup google.com > /dev/null 2>&1 && echo "✅ DNS works" || echo "❌ DNS blocked"
        echo ""
        
        echo "3. Current firewall status:"
        ufw status verbose 2>/dev/null || iptables -L -n -v | head -20
        echo ""
        
        echo "4. Active processes:"
        ps aux --sort=-%cpu | head -20
        echo ""
        
        echo "5. Network connections (if any):"
        ss -tunap 2>/dev/null | head -30 || netstat -tunap 2>/dev/null | head -30
        echo ""
        
        echo "6. System load:"
        uptime
        echo ""
        
        echo "7. Recent log entries (last 50 lines):"
        tail -50 /var/log/syslog 2>/dev/null | tail -20 || tail -50 /var/log/messages 2>/dev/null | tail -20
        echo ""
        
        echo "8. Check for suspicious files in common locations:"
        find /tmp /var/tmp -type f -mtime -3 -ls 2>/dev/null | head -10
        echo ""
        
        echo "9. Check systemd services:"
        systemctl list-units --type=service --state=running | grep -E "q-verse|nginx|usdtgverse" || echo "No Q-Verse services found"
        echo ""
        
        echo "10. Check for any processes trying to connect to 171.225.223.108:"
        netstat -tnp 2>/dev/null | grep "171.225.223.108" || ss -tnp 2>/dev/null | grep "171.225.223.108" || echo "No connections to attack target IP found"
        echo ""
REMOTE_CHECK
else
    echo "❌ Cannot connect to NYC3"
    echo ""
    echo "Possible reasons:"
    echo "  1. DigitalOcean has blocked outbound traffic (most likely)"
    echo "  2. SSH port (22) is blocked"
    echo "  3. Server is down"
    echo ""
    echo "💡 Recommendation:"
    echo "  - Check DigitalOcean dashboard for droplet status"
    echo "  - Review DigitalOcean support ticket"
    echo "  - Consider using DigitalOcean console access if SSH is blocked"
fi
