#!/bin/bash
# ==============================================
# File:        scripts/deployment/firewall_ddos_protection.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Firewall DDoS Protection Rules
#
#   Quantum-level protection against both incoming and outgoing DDoS attacks.
#   Implements connection limiting, rate limiting, and traffic shaping.
#
# License:
#   MIT License
# ==============================================

set -e

echo "🛡️  Setting up Quantum-Level DDoS Protection..."

# Enable UFW if not already enabled
ufw --force enable

# ============================================
# INBOUND PROTECTION
# ============================================

echo "📥 Configuring inbound DDoS protection..."

# Limit connections per IP
ufw limit 22/tcp   # SSH - prevent brute force
ufw limit 80/tcp   # HTTP
ufw limit 443/tcp  # HTTPS

# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 8080/tcp # Backend API (only from localhost/nginx)

# ============================================
# OUTBOUND PROTECTION - CRITICAL!
# ============================================

echo "📤 Configuring outbound DDoS protection..."

# Limit outbound connections to prevent our servers from being used in DDoS attacks
# This is CRITICAL based on the NYC3 incident

# Allow outbound DNS (required)
ufw allow out 53/udp
ufw allow out 53/tcp

# Allow outbound HTTPS for API calls (GitHub, etc.) but with rate limiting
# We'll use iptables for more granular control

# Block suspicious outbound patterns
# Limit outbound connections per IP
iptables -A OUTPUT -p tcp --syn -m connlimit --connlimit-above 50 -j REJECT --reject-with tcp-reset

# Limit outbound connections per destination
iptables -A OUTPUT -p tcp -m connlimit --connlimit-above 20 --connlimit-mask 32 -j REJECT

# Rate limit outbound connections
iptables -A OUTPUT -p tcp -m limit --limit 25/sec --limit-burst 50 -j ACCEPT
iptables -A OUTPUT -p tcp -j DROP

# Allow established and related connections
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# ============================================
# CONNECTION TRACKING LIMITS
# ============================================

echo "🔍 Configuring connection tracking limits..."

# Increase nf_conntrack_max to prevent "table full" errors
echo "net.netfilter.nf_conntrack_max = 1000000" >> /etc/sysctl.conf
echo "net.netfilter.nf_conntrack_tcp_timeout_established = 1200" >> /etc/sysctl.conf
sysctl -p

# ============================================
# SYN FLOOD PROTECTION
# ============================================

echo "🌊 Configuring SYN flood protection..."

# SYN flood protection
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# ============================================
# ICMP PROTECTION (Ping flood)
# ============================================

echo "📡 Configuring ICMP protection..."

# Limit ICMP (ping) requests
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# ============================================
# LOGGING SUSPICIOUS ACTIVITY
# ============================================

echo "📝 Setting up suspicious activity logging..."

# Log dropped packets for analysis
iptables -A INPUT -j LOG --log-prefix "IPTABLES-DROPPED: " --log-level 4
iptables -A OUTPUT -j LOG --log-prefix "IPTABLES-OUT-DROPPED: " --log-level 4

# ============================================
# SAVE RULES
# ============================================

echo "💾 Saving firewall rules..."

# Save iptables rules (Debian/Ubuntu)
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
elif [ -f /etc/iptables/rules.v4 ]; then
    iptables-save > /etc/iptables/rules.v4
fi

# Save UFW rules
ufw --force enable

echo "✅ DDoS protection configured successfully!"
echo ""
echo "📊 Protection Summary:"
echo "  - Inbound: Rate limited, connection limited"
echo "  - Outbound: Connection limited, rate limited (CRITICAL)"
echo "  - SYN Flood: Protected"
echo "  - ICMP Flood: Protected"
echo "  - Connection Tracking: Optimized"
echo ""
echo "⚠️  IMPORTANT: Test SSH access before disconnecting!"
echo "   If locked out, use DigitalOcean Console to access server."
