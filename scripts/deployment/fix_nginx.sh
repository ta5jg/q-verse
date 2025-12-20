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

echo "🔧 Fixing Nginx Configuration on All Servers..."

for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "🔧 Fixing Nginx on $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name"
        continue
    fi

    # Upload fixed Nginx config
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/q-verse.org <<'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name q-verse.org www.q-verse.org 159.203.83.98;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
    
    # Swagger UI
    location /swagger-ui/ {
        proxy_pass http://localhost:8080/swagger-ui/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINXCONF
"

    # Check backend status
    echo "🔍 Checking backend status on $name..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        systemctl status q-verse-core --no-pager | head -5 || echo 'Backend not running'
        echo '---'
        netstat -tlnp | grep ':8080' || echo 'Port 8080 not listening'
    "
    
    # Test and reload Nginx
    echo "🧪 Testing Nginx configuration on $name..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        nginx -t && systemctl reload nginx && echo '✅ Nginx reloaded successfully' || echo '❌ Nginx reload failed'
    "
    
    echo "✅ $name fixed."
done

echo "🎉 Nginx configuration fixed on all servers!"
