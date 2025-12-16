#!/bin/bash
set -e

echo "🌐 Installing Q-Verse Web..."

# 1. Install Node.js (Force Upgrade to v20) & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 2. Setup App Directory
mkdir -p /opt/q-verse-web
if [ -d "/tmp/qverse_web_upload" ]; then
    rsync -av /tmp/qverse_web_upload/ /opt/q-verse-web/
fi

cd /opt/q-verse-web

# 3. Install & Build
echo "📦 Installing Dependencies..."
npm install --omit=dev # Install prod deps
npm install --save-dev typescript @types/node @types/react @types/react-dom eslint eslint-config-next # Ensure build deps exist
npm run build

# 4. Start with PM2
echo "🚀 Starting Web Server..."
pm2 delete q-verse-web || true
pm2 start npm --name "q-verse-web" -- start -- -p 3000
pm2 save
pm2 startup | bash || true # Ensure it runs on boot

# 5. Nginx Configuration
echo "⚙️ Configuring Nginx for q-verse.org..."

# Create config if not exists or update it
cat > /etc/nginx/sites-available/q-verse.org <<NGINX
server {
    listen 80;
    server_name q-verse.org www.q-verse.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Proxy (optional if frontend calls API via public URL, but good to have)
    location /api/ {
        proxy_pass http://localhost:8080/; 
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

# Enable Site
ln -sf /etc/nginx/sites-available/q-verse.org /etc/nginx/sites-enabled/
# Ensure usdtgverse.com is still enabled if it exists
if [ -f /etc/nginx/sites-available/usdtgverse.com ]; then
    ln -sf /etc/nginx/sites-available/usdtgverse.com /etc/nginx/sites-enabled/
fi

# Test & Reload
nginx -t && systemctl reload nginx

echo "✅ Q-Verse Web Deployed & Nginx Configured!"
