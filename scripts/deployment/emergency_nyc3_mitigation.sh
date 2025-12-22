#!/bin/bash
set -e

# NYC3 Droplet Emergency Mitigation Script
# This script should be run via DigitalOcean Console

echo "🚨 NYC3 Emergency Mitigation Script"
echo "===================================="
echo ""

# 1. Check current system load
echo "1️⃣  Checking system load..."
uptime
echo ""

# 2. Check network connections
echo "2️⃣  Checking active network connections..."
ss -tn | wc -l
echo "Active TCP connections count"
echo ""

# 3. Check nf_conntrack status
echo "3️⃣  Checking nf_conntrack status..."
if [ -f /proc/sys/net/netfilter/nf_conntrack_max ]; then
    echo "Current nf_conntrack_max: $(cat /proc/sys/net/netfilter/nf_conntrack_max)"
    echo "Current nf_conntrack_count: $(cat /proc/sys/net/netfilter/nf_conntrack_count 2>/dev/null || echo 'N/A')"
else
    echo "nf_conntrack module not loaded or not available"
fi
echo ""

# 4. Increase nf_conntrack limits (temporary fix)
echo "4️⃣  Increasing nf_conntrack limits..."
if [ -f /proc/sys/net/netfilter/nf_conntrack_max ]; then
    CURRENT_MAX=$(cat /proc/sys/net/netfilter/nf_conntrack_max)
    NEW_MAX=1048576  # 1M connections
    
    if [ "$CURRENT_MAX" -lt "$NEW_MAX" ]; then
        echo "Increasing nf_conntrack_max from $CURRENT_MAX to $NEW_MAX"
        sysctl -w net.netfilter.nf_conntrack_max=$NEW_MAX
        echo "net.netfilter.nf_conntrack_max=$NEW_MAX" >> /etc/sysctl.conf
    else
        echo "nf_conntrack_max already at $CURRENT_MAX (>= $NEW_MAX)"
    fi
    
    # Also increase timeout to prevent table from filling too quickly
    sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=1200
    echo "net.netfilter.nf_conntrack_tcp_timeout_established=1200" >> /etc/sysctl.conf
    
    sysctl -p
    echo "✅ nf_conntrack limits increased"
else
    echo "⚠️  nf_conntrack not available, skipping"
fi
echo ""

# 5. Check and kill suspicious processes
echo "5️⃣  Checking for suspicious processes..."
echo "Top CPU processes:"
ps aux --sort=-%cpu | head -10
echo ""
echo "Top memory processes:"
ps aux --sort=-%mem | head -10
echo ""

# 6. Check for suspicious network connections
echo "6️⃣  Checking suspicious outbound connections..."
echo "Connections to attack target (171.225.223.108):"
ss -tn | grep "171.225.223.108" || echo "No connections to attack target found"
echo ""

# 7. Check UFW status
echo "7️⃣  Checking UFW firewall status..."
ufw status verbose | head -20
echo ""

# 8. Block all outbound traffic except essential services
echo "8️⃣  Blocking suspicious outbound traffic..."
# Block outbound to attack target
ufw deny out to 171.225.223.108
echo "✅ Blocked outbound to attack target"

# Allow only essential outbound traffic
ufw allow out 22/tcp   # SSH
ufw allow out 53/udp   # DNS
ufw allow out 80/tcp   # HTTP
ufw allow out 443/tcp  # HTTPS
ufw allow out 8080/tcp # Backend

# Deny all other outbound by default (if not already set)
ufw default deny outgoing
ufw default allow incoming

echo "✅ Outbound traffic restricted"
echo ""

# 9. Check systemd services
echo "9️⃣  Checking systemd services..."
systemctl list-units --type=service --state=running | grep -E "(q-verse|nginx|ssh)" || echo "No matching services found"
echo ""

# 10. Check recent logins
echo "🔟 Checking recent logins..."
last -10
echo ""

# 11. Check for suspicious cron jobs
echo "1️⃣1️⃣  Checking cron jobs..."
crontab -l 2>/dev/null || echo "No crontab for root"
ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ 2>/dev/null | head -20
echo ""

# 12. Check disk I/O
echo "1️⃣2️⃣  Checking disk I/O..."
iostat -x 1 2 2>/dev/null || echo "iostat not available"
echo ""

# 13. Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RECOMMENDATIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. If nf_conntrack table is still full, reboot the droplet:"
echo "   systemctl reboot"
echo ""
echo "2. After reboot, check if attack is still ongoing"
echo ""
echo "3. Consider rebuilding the droplet if compromise is confirmed"
echo ""
echo "4. Apply security hardening from apply_security_hardening.sh"
echo ""
echo "✅ Emergency mitigation script completed!"
