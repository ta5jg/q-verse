#!/bin/bash
set -e

# Droplets
NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_USER="root"
if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY="$HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
else
    echo "❌ SSH key not found"
    exit 1
fi

echo "🔒 Q-Verse Security Audit - Checking for Compromises"
echo "===================================================="
echo ""

# Function to run security checks on a server
check_server() {
    local name=$1
    local ip=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Checking: $name ($ip)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️  Cannot connect to $name - SKIPPING"
        echo ""
        return
    fi
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" bash <<'REMOTE_SCRIPT'
        echo ""
        echo "📊 1. ACTIVE NETWORK CONNECTIONS (Top 20 by packets):"
        echo "─────────────────────────────────────────────────────"
        ss -tunap 2>/dev/null | head -20 || netstat -tunap 2>/dev/null | head -20
        echo ""
        
        echo "🌐 2. OUTBOUND CONNECTIONS TO SUSPICIOUS IPs:"
        echo "─────────────────────────────────────────────────────"
        # Check for connections to the attack target IP
        ss -tn 2>/dev/null | grep -E "171\.225\.223\.108|ESTAB" | head -10 || netstat -tn 2>/dev/null | grep -E "171\.225\.223\.108|ESTAB" | head -10
        echo ""
        
        echo "⚙️  3. TOP CPU/MEMORY PROCESSES:"
        echo "─────────────────────────────────────────────────────"
        ps aux --sort=-%cpu | head -15
        echo ""
        
        echo "🔌 4. LISTENING PORTS (All):"
        echo "─────────────────────────────────────────────────────"
        ss -tlnp 2>/dev/null | grep LISTEN || netstat -tlnp 2>/dev/null | grep LISTEN
        echo ""
        
        echo "👤 5. RECENT LOGIN ATTEMPTS:"
        echo "─────────────────────────────────────────────────────"
        last -20 2>/dev/null | head -10 || tail -20 /var/log/auth.log 2>/dev/null | grep -E "Failed|Accepted" | tail -10
        echo ""
        
        echo "📝 6. SUSPICIOUS PROCESSES (High network/CPU):"
        echo "─────────────────────────────────────────────────────"
        ps aux --sort=-%cpu | awk 'NR>1 && ($3 > 10 || $4 > 10) {print $2, $3"%", $4"%", $11, $12, $13, $14, $15, $16, $17}' | head -10
        echo ""
        
        echo "🔍 7. PROCESSES WITH NETWORK CONNECTIONS:"
        echo "─────────────────────────────────────────────────────"
        lsof -i -P -n 2>/dev/null | head -20 || ss -tunap 2>/dev/null | grep ESTAB | head -10
        echo ""
        
        echo "📁 8. RECENTLY MODIFIED FILES IN /tmp, /var/tmp:"
        echo "─────────────────────────────────────────────────────"
        find /tmp /var/tmp -type f -mtime -7 -ls 2>/dev/null | head -10
        echo ""
        
        echo "🔐 9. CRON JOBS (All users):"
        echo "─────────────────────────────────────────────────────"
        crontab -l 2>/dev/null || echo "No crontab for root"
        for user in $(cut -d: -f1 /etc/passwd); do
            crontab -u "$user" -l 2>/dev/null | grep -v "^#" | grep -v "^$" && echo "  (user: $user)"
        done
        echo ""
        
        echo "🌍 10. SYSTEMD SERVICES STATUS:"
        echo "─────────────────────────────────────────────────────"
        systemctl list-units --type=service --state=running | grep -E "q-verse|nginx|pm2" || echo "No Q-Verse services found"
        echo ""
        
        echo "📊 11. NETWORK STATISTICS (ifstat/iftop if available):"
        echo "─────────────────────────────────────────────────────"
        if command -v ifstat &> /dev/null; then
            timeout 2 ifstat -t 1 1 2>/dev/null || echo "ifstat not available"
        else
            cat /proc/net/dev | head -5
        fi
        echo ""
        
        echo "🚨 12. CHECKING FOR COMMON MALWARE INDICATORS:"
        echo "─────────────────────────────────────────────────────"
        # Check for suspicious binaries
        find /usr/bin /usr/sbin /bin /sbin -type f -perm -4000 2>/dev/null | xargs ls -lh 2>/dev/null | head -10
        # Check for processes with suspicious names
        ps aux | grep -E "miner|ddos|bot|backdoor|trojan" -i | grep -v grep || echo "No obvious malware process names found"
        echo ""
        
        echo "📈 13. DISK I/O ACTIVITY:"
        echo "─────────────────────────────────────────────────────"
        iostat -x 1 2 2>/dev/null | tail -5 || echo "iostat not available"
        echo ""
        
        echo "✅ Security check completed for this server"
        echo ""
REMOTE_SCRIPT
}

# Check all servers
for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    check_server "$name" "$ip"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Security audit completed!"
echo ""
echo "⚠️  IMPORTANT: Review the output above for:"
echo "   - Unusual outbound connections"
echo "   - High CPU/memory processes"
echo "   - Suspicious processes or files"
echo "   - Unauthorized cron jobs"
echo "   - Unexpected listening ports"
echo ""
echo "📋 Next steps if compromise detected:"
echo "   1. Document all findings"
echo "   2. Stop suspicious processes"
echo "   3. Block suspicious IPs with firewall"
echo "   4. Review and secure SSH access"
echo "   5. Consider rebuilding droplet if severely compromised"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
