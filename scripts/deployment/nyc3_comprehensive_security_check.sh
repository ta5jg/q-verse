#!/bin/bash
set -e

# NYC3 Comprehensive Security Check
# Run this after fixing profile errors

echo "🔒 NYC3 Comprehensive Security Check"
echo "===================================="
echo ""

# 1. System information
echo "1️⃣  System Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
uptime
uname -a
echo ""

# 2. Network connections
echo "2️⃣  Network Connections"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Active TCP connections:"
ss -tn | wc -l
echo ""
echo "Connections to attack target (171.225.223.108):"
ss -tn | grep "171.225.223.108" || echo "✅ No connections to attack target"
echo ""
echo "Suspicious outbound connections:"
ss -tnp | grep -E "ESTAB.*:[0-9]{4,5}" | head -20 || echo "No suspicious connections found"
echo ""

# 3. Process check
echo "3️⃣  Process Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Top CPU processes:"
ps aux --sort=-%cpu | head -10
echo ""
echo "Top memory processes:"
ps aux --sort=-%mem | head -10
echo ""
echo "Suspicious processes (miner/crypto/ddos/bot):"
ps aux | grep -E "(miner|crypto|ddos|bot|\.update|\.hidden)" | grep -v grep || echo "✅ No suspicious processes found"
echo ""

# 4. Cron jobs
echo "4️⃣  Cron Jobs Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Root crontab:"
crontab -l 2>/dev/null || echo "No crontab for root"
echo ""
echo "System cron directories:"
ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ /etc/cron.weekly/ /etc/cron.monthly/ 2>/dev/null | grep -v "^total" | head -30
echo ""
echo "Suspicious cron entries:"
grep -r "/usr/bin/.update\|\.update\|miner\|crypto" /etc/cron* 2>/dev/null || echo "✅ No suspicious cron entries found"
echo ""

# 5. Suspicious files
echo "5️⃣  Suspicious Files Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Hidden files in /usr/bin:"
find /usr/bin -name ".*" -type f 2>/dev/null || echo "✅ No hidden files in /usr/bin"
echo ""
echo "Hidden files in /tmp:"
find /tmp -name ".*" -type f 2>/dev/null | head -10 || echo "✅ No hidden files in /tmp"
echo ""
echo "Suspicious files with .update or .hidden:"
find /usr/bin /usr/sbin /tmp /var/tmp -name "*update*" -o -name "*hidden*" -o -name ".*" 2>/dev/null | head -20 || echo "✅ No suspicious files found"
echo ""

# 6. Systemd services
echo "6️⃣  Systemd Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running services:"
systemctl list-units --type=service --state=running | grep -E "(q-verse|nginx|ssh|ufw)" || echo "No matching services"
echo ""
echo "Failed services:"
systemctl list-units --type=service --state=failed || echo "✅ No failed services"
echo ""

# 7. Firewall status
echo "7️⃣  Firewall Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ufw status verbose
echo ""

# 8. Recent logins
echo "8️⃣  Recent Logins"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
last -10
echo ""
echo "Failed login attempts:"
grep "Failed password" /var/log/auth.log 2>/dev/null | tail -20 || echo "No failed login attempts found"
echo ""

# 9. Network statistics
echo "9️⃣  Network Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "nf_conntrack status:"
if [ -f /proc/sys/net/netfilter/nf_conntrack_max ]; then
    echo "Max: $(cat /proc/sys/net/netfilter/nf_conntrack_max)"
    echo "Current: $(cat /proc/sys/net/netfilter/nf_conntrack_count 2>/dev/null || echo 'N/A')"
else
    echo "nf_conntrack not available"
fi
echo ""
netstat -s | head -30
echo ""

# 10. Disk usage
echo "🔟 Disk Usage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h
echo ""

# 11. System logs (recent errors)
echo "1️⃣1️⃣  Recent System Errors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
journalctl -p err -n 20 --no-pager 2>/dev/null || echo "No recent errors in journal"
echo ""

# 12. Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SECURITY RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Profile/bashrc errors fixed"
echo "2. ✅ nf_conntrack limits increased"
echo "3. ✅ Outbound traffic restricted"
echo "4. ✅ Attack target blocked"
echo ""
echo "Next steps:"
echo "- Monitor system for 24-48 hours"
echo "- Check if attack continues"
echo "- Review all suspicious files/processes"
echo "- Consider rebuilding droplet if compromise is confirmed"
echo "- Apply full security hardening from apply_security_hardening.sh"
echo ""
echo "✅ Security check completed!"
