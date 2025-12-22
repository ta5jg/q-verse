#!/bin/bash
# NYC3 Console Commands - Run these in DigitalOcean Console
# Copy and paste these commands one by one into the console

echo "=== NYC3 Security Investigation ==="
echo ""

echo "1. System Status:"
uptime
echo ""

echo "2. Top Processes:"
ps aux --sort=-%cpu | head -20
echo ""

echo "3. Network Connections:"
ss -tunap | head -30
echo ""

echo "4. Firewall Status:"
ufw status verbose 2>/dev/null || iptables -L -n -v | head -20
echo ""

echo "5. Suspicious Processes:"
ps aux | grep -E "(miner|ddos|bot|backdoor|curl.*http|wget.*http)" -i | grep -v grep || echo "None found"
echo ""

echo "6. Cron Jobs:"
crontab -l
for user in $(cut -d: -f1 /etc/passwd); do
    crontab -u "$user" -l 2>/dev/null | grep -v "^#" | grep -v "^$" && echo "  (user: $user)"
done
echo ""

echo "7. Recent Logins:"
last -20
echo ""

echo "8. System Logs (last 50 lines):"
tail -50 /var/log/syslog 2>/dev/null | tail -20 || tail -50 /var/log/messages 2>/dev/null | tail -20
echo ""

echo "9. Outbound Connectivity Test:"
timeout 3 curl -s https://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTPS works" || echo "❌ Outbound HTTPS blocked"
timeout 3 curl -s http://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTP works" || echo "❌ Outbound HTTP blocked"
echo ""

echo "10. Check for suspicious files:"
find /tmp /var/tmp -type f -mtime -7 -ls 2>/dev/null | head -10
echo ""

echo "11. Check systemd services:"
systemctl list-units --type=service --state=running | grep -E "q-verse|nginx|usdtgverse"
echo ""

echo "=== Investigation Complete ==="
