#!/bin/bash
set -e

echo "🌐 Installing Q-Verse Web..." >> /var/log/qverse_web_install.log

# Install PM2 if missing
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Setup Dir
mkdir -p /opt/q-verse-web

# Move files
if [ -d "/tmp/qverse_web_upload" ]; then
    rm -rf /opt/q-verse-web/.next
    # Don't delete public if not uploaded to save bandwidth, but here we wipe clean to be safe
    # Actually, we should sync source code
    
    # Sync source files
    cp -r /tmp/qverse_web_upload/* /opt/q-verse-web/
fi

cd /opt/q-verse-web

# Install Deps (Legacy Peer Deps for React 19 compat)
echo "📦 Installing Dependencies..." >> /var/log/qverse_web_install.log
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps

# Build with RAM Limit
echo "🛠 Building..." >> /var/log/qverse_web_install.log
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build >> /var/log/qverse_web_install.log 2>&1

# Fix Permissions
chmod -R 755 /opt/q-verse-web

# Start App
echo "🚀 Starting App..." >> /var/log/qverse_web_install.log
pm2 delete q-verse-web || true
pm2 start npm --name "q-verse-web" -- start -- -p 3000
pm2 save
pm2 startup | bash || true

# Nginx Config
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/q-verse.org <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name q-verse.org www.q-verse.org 159.203.83.98;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080/; 
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/q-verse.org /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d q-verse.org -d www.q-verse.org --non-interactive --agree-tos --register-unsafely-without-email --redirect --reinstall || true

echo "✅ Q-Verse Live!" >> /var/log/qverse_web_install.log
