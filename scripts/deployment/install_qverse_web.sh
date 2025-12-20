#!/bin/bash
set -e

echo "🌐 Installing Q-Verse Web..." >> /var/log/qverse_web_install.log

# 1. Install Node.js & Tools
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 2. Setup App Directory
mkdir -p /opt/q-verse-web
if [ -d "/tmp/qverse_web_upload" ]; then
    rsync -av /tmp/qverse_web_upload/ /opt/q-verse-web/
fi

cd /opt/q-verse-web

# 3. Install & Build (Legacy Peer Deps Fix)
echo "📦 Installing Dependencies..." >> /var/log/qverse_web_install.log
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps

echo "🛠 Building..." >> /var/log/qverse_web_install.log
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build >> /var/log/qverse_web_install.log 2>&1

# 4. Start with PM2 (Optimized)
echo "🚀 Starting Web Server..." >> /var/log/qverse_web_install.log
pm2 delete q-verse-web || true
NODE_OPTIONS="--max-old-space-size=2048" pm2 start npm --name "q-verse-web" -- start -- -p 3000
pm2 save
pm2 startup | bash || true

# --- NGINX CONFIGURATION: BOTH SITES COEXIST ---
echo "⚙️ Configuring Nginx for q-verse.org (keeping usdtgverse.com)..." >> /var/log/qverse_web_install.log

# Remove old q-verse.org config if exists
rm -f /etc/nginx/sites-enabled/q-verse.org

# Create Q-Verse.org config (HTTP + HTTPS)
cat > /etc/nginx/sites-available/q-verse.org <<NGINX
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name q-verse.org www.q-verse.org;
    
    # Allow Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name q-verse.org www.q-verse.org;

    # SSL certificates (will be managed by certbot)
    ssl_certificate /etc/letsencrypt/live/q-verse.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/q-verse.org/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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
        send_timeout 60s;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080/; 
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        send_timeout 60s;
    }
}
NGINX

# Enable q-verse.org
ln -sf /etc/nginx/sites-available/q-verse.org /etc/nginx/sites-enabled/q-verse.org

# Ensure usdtgverse.com is configured with HTTPS (if exists)
if [ -f /etc/nginx/sites-available/usdtgverse.com ]; then
    echo "🔒 Configuring usdtgverse.com HTTPS..." >> /var/log/qverse_web_install.log
    cat > /etc/nginx/sites-available/usdtgverse.com <<USDTNGINX
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
    
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
USDTNGINX
    ln -sf /etc/nginx/sites-available/usdtgverse.com /etc/nginx/sites-enabled/usdtgverse.com
fi

# Test and reload Nginx
echo "🧪 Testing Nginx configuration..." >> /var/log/qverse_web_install.log
nginx -t >> /var/log/qverse_web_install.log 2>&1
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully" >> /var/log/qverse_web_install.log
else
    echo "❌ Nginx configuration test failed!" >> /var/log/qverse_web_install.log
    exit 1
fi

# RE-APPLY SSL for q-verse.org
echo "🔒 Re-applying SSL for q-verse.org..." >> /var/log/qverse_web_install.log
certbot --nginx -d q-verse.org -d www.q-verse.org --non-interactive --agree-tos --register-unsafely-without-email --redirect --reinstall >> /var/log/qverse_web_install.log 2>&1 || {
    echo "⚠️ SSL certificate installation failed, but continuing..." >> /var/log/qverse_web_install.log
    # If certbot fails, try to get certificate
    certbot certonly --nginx -d q-verse.org -d www.q-verse.org --non-interactive --agree-tos --register-unsafely-without-email >> /var/log/qverse_web_install.log 2>&1 || true
}

echo "✅ Q-Verse Live (Default Server)!" >> /var/log/qverse_web_install.log
