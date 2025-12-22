#!/bin/bash
set -e

# Droplets
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

echo "🔒 Applying Security Hardening to FRA1 and SFO2"
echo "=============================================="
echo ""

harden_server() {
    local name=$1
    local ip=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔒 Hardening: $name ($ip)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️  Cannot connect to $name - SKIPPING"
        echo ""
        return
    fi
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" bash <<'HARDEN_SCRIPT'
        set -e
        echo ""
        
        # 1. Update system packages
        echo "📦 1. Updating system packages..."
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -qq
        apt-get upgrade -y -qq 2>&1 | grep -E "(upgraded|installed|removed)" || echo "System up to date"
        echo "✅ System packages updated"
        echo ""
        
        # 2. Install and configure UFW firewall
        echo "🔥 2. Configuring firewall (UFW)..."
        if ! command -v ufw &> /dev/null; then
            apt-get install -y -qq ufw
        fi
        
        # Reset to defaults
        ufw --force reset
        
        # Allow SSH (CRITICAL!)
        ufw allow 22/tcp comment 'SSH'
        
        # Allow HTTP/HTTPS
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        
        # Allow our application ports
        ufw allow 8080/tcp comment 'Q-Verse Backend'
        
        # Allow monitoring ports (if needed)
        ufw allow from 127.0.0.1 to any port 9090 comment 'Prometheus (localhost only)'
        ufw allow from 127.0.0.1 to any port 3000 comment 'Grafana (localhost only)'
        
        # Block all other inbound by default
        ufw default deny incoming
        # Allow all outbound (we need this for legitimate services)
        ufw default allow outgoing
        
        # Enable firewall
        ufw --force enable
        
        echo "✅ Firewall configured and enabled"
        ufw status verbose
        echo ""
        
        # 3. Secure SSH configuration
        echo "🔐 3. Securing SSH configuration..."
        SSH_CONFIG="/etc/ssh/sshd_config"
        
        # Backup original config
        cp "$SSH_CONFIG" "${SSH_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Disable password authentication (key-based only)
        sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' "$SSH_CONFIG"
        sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' "$SSH_CONFIG"
        
        # Disable root login with password (key-based still works)
        sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' "$SSH_CONFIG"
        sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' "$SSH_CONFIG"
        
        # Disable empty passwords
        sed -i 's/#PermitEmptyPasswords yes/PermitEmptyPasswords no/' "$SSH_CONFIG"
        sed -i 's/PermitEmptyPasswords yes/PermitEmptyPasswords no/' "$SSH_CONFIG"
        
        # Set max authentication attempts
        if ! grep -q "^MaxAuthTries" "$SSH_CONFIG"; then
            echo "MaxAuthTries 3" >> "$SSH_CONFIG"
        fi
        
        # Set idle timeout
        if ! grep -q "^ClientAliveInterval" "$SSH_CONFIG"; then
            echo "ClientAliveInterval 300" >> "$SSH_CONFIG"
            echo "ClientAliveCountMax 2" >> "$SSH_CONFIG"
        fi
        
        # Test SSH config before restarting
        if sshd -t; then
            echo "✅ SSH configuration is valid"
            # Restart SSH (but keep current connection alive)
            systemctl reload sshd || systemctl restart sshd
            echo "✅ SSH service reloaded"
        else
            echo "⚠️  SSH configuration has errors - not restarting"
            echo "Restoring backup..."
            cp "${SSH_CONFIG}.backup."* "$SSH_CONFIG" 2>/dev/null || true
        fi
        echo ""
        
        # 4. Install fail2ban for brute force protection
        echo "🛡️  4. Installing fail2ban..."
        if ! command -v fail2ban-client &> /dev/null; then
            apt-get install -y -qq fail2ban
            systemctl enable fail2ban
            systemctl start fail2ban
            echo "✅ fail2ban installed and started"
        else
            systemctl restart fail2ban
            echo "✅ fail2ban restarted"
        fi
        echo ""
        
        # 5. Check and remove suspicious processes
        echo "🔍 5. Checking for suspicious processes..."
        SUSPICIOUS_FOUND=0
        
        # Check for processes making excessive connections
        for pid in $(ss -tnp 2>/dev/null | grep ESTAB | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | sort -u | grep -E '^[0-9]+$'); do
            if [ ! -z "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
                cmd=$(ps -p "$pid" -o cmd= 2>/dev/null | head -1)
                # Check if it's not a legitimate service
                if ! echo "$cmd" | grep -qE "(systemd|sshd|nginx|q-verse-core|pm2|node|postgres|grafana|prometheus|usdtgverse_node)"; then
                    echo "⚠️  Suspicious process found: PID $pid"
                    echo "    Command: $cmd"
                    SUSPICIOUS_FOUND=1
                fi
            fi
        done
        
        if [ $SUSPICIOUS_FOUND -eq 0 ]; then
            echo "✅ No suspicious processes found"
        fi
        echo ""
        
        # 6. Check and secure cron jobs
        echo "⏰ 6. Checking cron jobs..."
        CRON_SUSPICIOUS=0
        
        # Check root crontab
        if crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | grep -qE "(curl|wget|bash|sh).*http"; then
            echo "⚠️  Suspicious cron job found in root crontab"
            crontab -l 2>/dev/null | grep -E "(curl|wget|bash|sh).*http"
            CRON_SUSPICIOUS=1
        fi
        
        # Check all user crontabs
        for user in $(cut -d: -f1 /etc/passwd); do
            if crontab -u "$user" -l 2>/dev/null | grep -v "^#" | grep -v "^$" | grep -qE "(curl|wget|bash|sh).*http"; then
                echo "⚠️  Suspicious cron job found for user: $user"
                crontab -u "$user" -l 2>/dev/null | grep -E "(curl|wget|bash|sh).*http"
                CRON_SUSPICIOUS=1
            fi
        done
        
        if [ $CRON_SUSPICIOUS -eq 0 ]; then
            echo "✅ No suspicious cron jobs found"
        fi
        echo ""
        
        # 7. Check file permissions
        echo "📁 7. Checking critical file permissions..."
        # Ensure /tmp and /var/tmp have proper permissions
        chmod 1777 /tmp /var/tmp 2>/dev/null || true
        echo "✅ /tmp and /var/tmp permissions checked"
        echo ""
        
        # 8. Enable automatic security updates
        echo "🔄 8. Configuring automatic security updates..."
        if ! command -v unattended-upgrades &> /dev/null; then
            apt-get install -y -qq unattended-upgrades
        fi
        
        # Enable automatic security updates
        echo 'Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";' > /etc/apt/apt.conf.d/50unattended-upgrades
        
        systemctl enable unattended-upgrades
        systemctl start unattended-upgrades
        echo "✅ Automatic security updates configured"
        echo ""
        
        # 9. Check for listening ports that shouldn't be open
        echo "🔌 9. Reviewing listening ports..."
        echo "Current listening ports:"
        ss -tlnp 2>/dev/null | grep LISTEN | grep -v "127.0.0.1" | grep -v "::1" || netstat -tlnp 2>/dev/null | grep LISTEN | grep -v "127.0.0.1"
        echo ""
        
        # 10. Create security monitoring script
        echo "📊 10. Setting up security monitoring..."
        mkdir -p /opt/q-verse/scripts
        cat > /opt/q-verse/scripts/security_monitor.sh <<'MONITOR_SCRIPT'
#!/bin/bash
# Security monitoring script
LOG_FILE="/var/log/q-verse/security_monitor.log"
mkdir -p /var/log/q-verse

{
    echo "=== Security Check $(date) ==="
    echo "Active connections:"
    ss -tn 2>/dev/null | grep ESTAB | wc -l
    echo "Suspicious processes:"
    ps aux | grep -E "(miner|ddos|bot|backdoor)" -i | grep -v grep || echo "None"
    echo "Failed login attempts (last hour):"
    grep "Failed password" /var/log/auth.log 2>/dev/null | tail -10 || echo "None"
    echo ""
} >> "$LOG_FILE"

# Keep only last 7 days of logs
find /var/log/q-verse -name "security_monitor.log" -mtime +7 -delete 2>/dev/null || true
MONITOR_SCRIPT
        
        chmod +x /opt/q-verse/scripts/security_monitor.sh
        
        # Add to crontab if not exists
        if ! crontab -l 2>/dev/null | grep -q "security_monitor.sh"; then
            (crontab -l 2>/dev/null; echo "*/30 * * * * /opt/q-verse/scripts/security_monitor.sh") | crontab -
        fi
        
        echo "✅ Security monitoring script installed"
        echo ""
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Security hardening completed for this server!"
        echo ""
        echo "📋 Summary of changes:"
        echo "   ✓ System packages updated"
        echo "   ✓ Firewall (UFW) configured and enabled"
        echo "   ✓ SSH secured (password auth disabled)"
        echo "   ✓ fail2ban installed for brute force protection"
        echo "   ✓ Automatic security updates enabled"
        echo "   ✓ Security monitoring script installed"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HARDEN_SCRIPT
}

# Apply hardening to both servers
for server in "FRA1:$FRA1_IP" "SFO2:$SFO2_IP"; do
    IFS=':' read -r name ip <<< "$server"
    harden_server "$name" "$ip"
done

echo ""
echo "🎉 Security hardening completed for FRA1 and SFO2!"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   1. SSH password authentication is now disabled (key-based only)"
echo "   2. Firewall is active - only ports 22, 80, 443, 8080 are open"
echo "   3. fail2ban is protecting against brute force attacks"
echo "   4. Automatic security updates are enabled"
echo "   5. Security monitoring runs every 30 minutes"
echo ""
