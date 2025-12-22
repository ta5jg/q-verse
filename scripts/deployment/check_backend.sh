#!/bin/bash
set -e

NYC3_IP="159.203.83.98"
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

echo "🔍 Checking Backend Status..."

for server in "NYC3:$NYC3_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "🔍 Checking $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Cannot connect to $name"
        continue
    fi

    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        echo '📊 Backend Service Status:'
        systemctl status q-verse-core --no-pager | head -5 || echo 'Service not found'
        echo ''
        echo '🔌 Port 8080 Status:'
        netstat -tlnp 2>/dev/null | grep 8080 || ss -tlnp | grep 8080 || echo 'Port 8080 not listening'
        echo ''
        echo '🧪 Testing Backend Endpoints:'
        echo 'Health:'
        curl -s http://localhost:8080/api/health | head -c 200 || echo 'FAILED'
        echo ''
        echo 'Metrics:'
        curl -s http://localhost:8080/api/metrics | head -c 200 || echo 'FAILED'
        echo ''
        echo 'Swagger UI:'
        curl -s -I http://localhost:8080/swagger-ui/ | head -3 || echo 'FAILED'
        echo ''
        echo '📝 Recent Backend Logs:'
        journalctl -u q-verse-core --no-pager -n 20 | tail -10 || echo 'No logs'
    "
done

echo "✅ Backend check complete!"
