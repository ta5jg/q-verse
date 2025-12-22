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

echo "🔍 Attempting Multiple Methods to Access NYC3 (159.203.83.98)"
echo "=============================================================="
echo ""

# Method 1: Standard SSH
echo "1️⃣  Method 1: Standard SSH (port 22)..."
if timeout 10 ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SSH_USER@$NYC3_IP" echo "OK" 2>&1; then
    echo "✅ Connection successful via standard SSH!"
    echo ""
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$NYC3_IP" bash <<'REMOTE_CHECK'
        echo "=== NYC3 Status Check ==="
        echo ""
        echo "System uptime:"
        uptime
        echo ""
        echo "Current processes:"
        ps aux --sort=-%cpu | head -15
        echo ""
        echo "Network connections:"
        ss -tunap 2>/dev/null | head -20 || netstat -tunap 2>/dev/null | head -20
        echo ""
        echo "Firewall status:"
        ufw status verbose 2>/dev/null || iptables -L -n -v | head -10
        echo ""
        echo "Recent log entries:"
        tail -30 /var/log/syslog 2>/dev/null | tail -15 || tail -30 /var/log/messages 2>/dev/null | tail -15
        echo ""
REMOTE_CHECK
    exit 0
else
    echo "❌ Standard SSH failed"
    echo ""
fi

# Method 2: Try different SSH ports
echo "2️⃣  Method 2: Trying alternative SSH ports..."
for port in 2222 22022 2200; do
    echo "   Trying port $port..."
    if timeout 5 ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 -p "$port" "$SSH_USER@$NYC3_IP" echo "OK" 2>&1; then
        echo "✅ Connection successful on port $port!"
        exit 0
    fi
done
echo "❌ Alternative SSH ports failed"
echo ""

# Method 3: Check if server is pingable
echo "3️⃣  Method 3: Checking if server responds to ping..."
if ping -c 3 -W 5 "$NYC3_IP" &> /dev/null; then
    echo "✅ Server is pingable (ICMP works)"
else
    echo "❌ Server does not respond to ping"
fi
echo ""

# Method 4: Check if HTTP/HTTPS ports are open
echo "4️⃣  Method 4: Checking HTTP/HTTPS connectivity..."
if timeout 5 curl -s -o /dev/null -w "%{http_code}" "http://$NYC3_IP" &> /dev/null; then
    HTTP_CODE=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" "http://$NYC3_IP" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "000" ]; then
        echo "✅ HTTP port is open (response code: $HTTP_CODE)"
        echo "   Testing HTTPS..."
        HTTPS_CODE=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" -k "https://$NYC3_IP" 2>/dev/null || echo "000")
        if [ "$HTTPS_CODE" != "000" ]; then
            echo "✅ HTTPS port is open (response code: $HTTPS_CODE)"
        fi
    fi
else
    echo "❌ HTTP/HTTPS ports not accessible"
fi
echo ""

# Method 5: Check if DigitalOcean Console access is needed
echo "5️⃣  Method 5: DigitalOcean Console Access Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  NYC3 droplet appears to be blocked by DigitalOcean."
echo ""
echo "📋 To access NYC3, you need to:"
echo ""
echo "   1. Go to DigitalOcean Dashboard:"
echo "      https://cloud.digitalocean.com/droplets"
echo ""
echo "   2. Find droplet: debian-s-4vcpu-8gb-240gb-intel-nyc3-01"
echo "      IP: 159.203.83.98"
echo ""
echo "   3. Click on the droplet → Click 'Console' button"
echo "      (This opens a web-based console)"
echo ""
echo "   4. Once in console, run these commands:"
echo ""
cat <<'CONSOLE_COMMANDS'
      # Check current status
      echo "=== System Status ==="
      uptime
      ps aux --sort=-%cpu | head -20
      
      # Check network
      echo "=== Network Connections ==="
      ss -tunap | head -30
      
      # Check firewall
      echo "=== Firewall Status ==="
      ufw status verbose || iptables -L -n -v | head -20
      
      # Check for suspicious processes
      echo "=== Suspicious Processes ==="
      ps aux | grep -E "(miner|ddos|bot|backdoor|curl.*http|wget.*http)" -i | grep -v grep || echo "None found"
      
      # Check cron jobs
      echo "=== Cron Jobs ==="
      crontab -l
      for user in $(cut -d: -f1 /etc/passwd); do
          crontab -u "$user" -l 2>/dev/null | grep -v "^#" | grep -v "^$" && echo "  (user: $user)"
      done
      
      # Check recent logins
      echo "=== Recent Logins ==="
      last -20
      
      # Check system logs
      echo "=== Recent System Logs ==="
      tail -50 /var/log/syslog | tail -20
      
      # Check if outbound is blocked
      echo "=== Testing Outbound Connectivity ==="
      timeout 3 curl -s https://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTPS works" || echo "❌ Outbound HTTPS blocked"
      timeout 3 curl -s http://www.google.com > /dev/null 2>&1 && echo "✅ Outbound HTTP works" || echo "❌ Outbound HTTP blocked"
CONSOLE_COMMANDS
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Alternative: Contact DigitalOcean Support"
echo "   - Reply to their email with findings"
echo "   - Request console access if SSH is blocked"
echo "   - Ask for guidance on removing restrictions"
echo ""
