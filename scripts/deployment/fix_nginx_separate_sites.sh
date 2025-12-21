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

echo "🔧 Fixing Nginx Configuration - Separate Sites..."

for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "🔧 Fixing Nginx on $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name"
        continue
    fi

    # Q-Verse.org Config (NO default_server - only for q-verse.org domain)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/q-verse.org <<'NGINXCONF'
# Q-Verse.org - Next.js Frontend
server {
    listen 80;
    listen [::]:80;
    server_name q-verse.org www.q-verse.org;

    # Backend API - MUST be before location / to match first
    location /api/ {
        proxy_pass http://localhost:8080/api/;
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
    
    # Frontend (Next.js) - MUST be last
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

    # USDTgVerse.com Config (Keep existing, but ensure it's separate)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        if [ -f /etc/nginx/sites-available/usdtgverse.com ]; then
            echo '✅ USDTgVerse config exists, keeping it'
        else
            echo '⚠️ USDTgVerse config not found, creating basic config'
            cat > /etc/nginx/sites-available/usdtgverse.com <<'USDTGCONF'
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name usdtgverse.com www.usdtgverse.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name usdtgverse.com www.usdtgverse.com;

    ssl_certificate /etc/letsencrypt/live/usdtgverse.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/usdtgverse.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /opt/usdtgverse;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
USDTGCONF
        fi
    "

    # Default server for IP access (fallback to q-verse.org)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/default <<'DEFAULTCONF'
# Default server for IP access - redirects to q-verse.org
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        return 301 http://q-verse.org\$request_uri;
    }
}
DEFAULTCONF
"

    # Enable configs
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        ln -sf /etc/nginx/sites-available/q-verse.org /etc/nginx/sites-enabled/q-verse.org
        ln -sf /etc/nginx/sites-available/usdtgverse.com /etc/nginx/sites-enabled/usdtgverse.com
        ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx && echo '✅ Nginx reloaded successfully' || echo '❌ Nginx reload failed'
    "
    
    echo "✅ $name fixed."
done

echo "🎉 Nginx configuration fixed - sites are now separate!"
