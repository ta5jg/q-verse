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

echo "🔧 Complete Nginx Fix - Separate Sites with SSL..."

for server in "NYC3:$NYC3_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "🔧 Fixing Nginx on $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name"
        continue
    fi

    # Remove ALL existing configs to start fresh
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        rm -f /etc/nginx/sites-enabled/*
        rm -f /etc/nginx/sites-available/q-verse.org
        rm -f /etc/nginx/sites-available/usdtgverse.com
        rm -f /etc/nginx/sites-available/default
    "

    # Q-Verse.org Config - HTTP (will add SSL after)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/q-verse.org <<'NGINXCONF'
# Q-Verse.org - HTTP Server
server {
    listen 80;
    listen [::]:80;
    server_name q-verse.org www.q-verse.org;

    # Backend API
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
    
    # WebSocket
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

    # USDTgVerse.com Config - HTTP (will add SSL after)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/usdtgverse.com <<'USDTGCONF'
# USDTgVerse.com - HTTP Server
server {
    listen 80;
    listen [::]:80;
    server_name usdtgverse.com www.usdtgverse.com;

    root /opt/usdtgverse;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }
    
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
USDTGCONF
"

    # Default server - redirect IP to q-verse.org
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "cat > /etc/nginx/sites-available/default <<'DEFAULTCONF'
# Default server for IP access
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
        nginx -t && systemctl reload nginx && echo '✅ Nginx reloaded' || echo '❌ Nginx reload failed'
    "

    # Install SSL for q-verse.org
    echo "🔒 Installing SSL for q-verse.org on $name..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
        certbot --nginx -d q-verse.org -d www.q-verse.org --non-interactive --agree-tos --register-unsafely-without-email --redirect --reinstall 2>&1 | tail -10 || echo 'SSL install failed or already exists'
    "

    # Install SSL for usdtgverse.com (only on NYC3)
    if [ "$name" = "NYC3" ]; then
        echo "🔒 Installing SSL for usdtgverse.com on $name..."
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "
            certbot --nginx -d usdtgverse.com -d www.usdtgverse.com --non-interactive --agree-tos --register-unsafely-without-email --redirect --reinstall 2>&1 | tail -10 || echo 'SSL install failed or already exists'
        "
    fi

    echo "✅ $name fixed."
done

echo "🎉 Complete Nginx fix applied!"
