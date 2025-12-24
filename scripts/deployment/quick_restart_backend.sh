#!/bin/bash
# Quick backend restart script
set -e

NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_KEY="$HOME/.ssh/id_ed25519"

for ip in "$NYC3_IP" "$SFO2_IP" "$FRA1_IP"; do
    echo "🔄 Restarting backend on $ip..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes root@$ip "systemctl restart q-verse-core" 2>&1 | grep -v "Warning\|Permanently" || true
    sleep 2
done

echo "✅ Backend restart initiated on all servers"
