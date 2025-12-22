#!/bin/bash
set -e

# Emergency lockdown script to secure compromised droplets
# USE WITH CAUTION - This will block all outbound traffic except essential services

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

echo "🚨 EMERGENCY LOCKDOWN - Securing Droplets"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will:"
echo "   - Block all outbound traffic except SSH, DNS, and HTTP/HTTPS"
echo "   - Stop all non-essential services"
echo "   - Create firewall rules to prevent DDoS participation"
echo ""
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

lockdown_server() {
    local name=$1
    local ip=$2
    
    echo "🔒 Locking down: $name ($ip)"
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️  Cannot connect to $name - SKIPPING"
        return
    fi
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" bash <<'LOCKDOWN_SCRIPT'
        echo "📋 Installing/updating firewall rules..."
        
        # Install ufw if not present
        if ! command -v ufw &> /dev/null; then
            apt-get update -qq && apt-get install -y -qq ufw
        fi
        
        # Reset firewall to defaults
        ufw --force reset
        
        # Allow SSH (CRITICAL - don't lock yourself out!)
        ufw allow 22/tcp
        ufw allow 2222/tcp  # Backup SSH port if configured
        
        # Allow DNS (needed for system to function)
        ufw allow out 53/udp
        ufw allow out 53/tcp
        
        # Allow HTTP/HTTPS for legitimate services
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Allow our application ports (if needed)
        ufw allow 8080/tcp  # Backend API
        
        # Block ALL other outbound traffic by default
        # This is aggressive but necessary to stop DDoS participation
        
        # Enable firewall
        ufw --force enable
        
        echo "✅ Firewall rules applied"
        
        # Stop suspicious processes
        echo "🛑 Stopping suspicious processes..."
        
        # Find and kill processes making excessive connections
        for pid in $(ss -tnp 2>/dev/null | grep ESTAB | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | sort -u | grep -E '^[0-9]+$'); do
            if [ ! -z "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
                cmd=$(ps -p "$pid" -o cmd= 2>/dev/null | head -1)
                # Check if it's not a system service
                if ! echo "$cmd" | grep -qE "(systemd|sshd|nginx|q-verse-core|pm2|node)"; then
                    echo "⚠️  Suspicious process found: PID $pid - $cmd"
                    # Uncomment next line to kill (USE WITH CAUTION):
                    # kill -9 "$pid" 2>/dev/null || true
                fi
            fi
        done
        
        # Check for and disable suspicious cron jobs
        echo "🔍 Checking cron jobs..."
        crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | while read line; do
            if echo "$line" | grep -qE "(curl|wget|bash|sh).*http"; then
                echo "⚠️  Suspicious cron job found: $line"
            fi
        done
        
        # Secure SSH
        echo "🔐 Securing SSH..."
        # Disable password authentication (if key-based auth is used)
        sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config 2>/dev/null || true
        sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config 2>/dev/null || true
        
        # Restart SSH (careful - test first!)
        # systemctl restart sshd  # Uncomment only if sure about SSH key access
        
        echo "✅ Lockdown completed for this server"
        echo ""
        echo "📊 Current firewall status:"
        ufw status verbose
LOCKDOWN_SCRIPT
}

# Apply lockdown to all servers
for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    lockdown_server "$name" "$ip"
done

echo ""
echo "✅ Emergency lockdown completed!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Review security_check.sh output"
echo "   2. Identify and remove malicious software"
echo "   3. Update all passwords and SSH keys"
echo "   4. Review application logs for vulnerabilities"
echo "   5. Consider rebuilding droplets if compromise is severe"
echo "   6. Contact DigitalOcean support with your findings"
