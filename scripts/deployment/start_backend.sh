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

echo "🚀 Starting Backend Services on All Servers..."

for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "🚀 Starting backend on $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name"
        continue
    fi

    # Check if backend binary exists
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        if [ ! -f /usr/local/bin/q-verse-core ]; then
            echo '❌ Backend binary not found. Checking build status...'
            tail -20 /var/log/qverse_install.log || echo 'No install log found'
            echo '---'
            if [ -d /opt/q-verse ]; then
                echo 'Checking /opt/q-verse...'
                ls -la /opt/q-verse/ | head -10
            fi
        else
            echo '✅ Backend binary found'
            # Start the service
            systemctl start q-verse-core
            sleep 2
            systemctl status q-verse-core --no-pager | head -10
            echo '---'
            # Check if port is listening
            ss -tlnp | grep ':8080' || echo 'Port 8080 not listening yet (may need a moment)'
        fi
    "
    
    echo "✅ $name checked."
done

echo "🎉 Backend services checked on all servers!"
