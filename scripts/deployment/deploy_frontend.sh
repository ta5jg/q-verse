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

echo "🚀 Deploying Q-Verse Frontend (Server Build Optimization)..."

# 1. Prepare Remote Install Script
cat << 'INSTALL_SCRIPT' > scripts/deployment/install_qverse_web.sh
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
INSTALL_SCRIPT

chmod +x scripts/deployment/install_qverse_web.sh

# 2. Deploy Loop
for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "📦 Uploading Source Code to $name ($ip)..."
    
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name"
        continue
    fi

    # Clean Temp
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "rm -rf /tmp/qverse_web_upload && mkdir -p /tmp/qverse_web_upload"
    
    # Upload Source (Exclude heavy folders)
    rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.next' --exclude '.git' q-verse-web/ "$SSH_USER@$ip":/tmp/qverse_web_upload/
    
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no scripts/deployment/install_qverse_web.sh "$SSH_USER@$ip":/tmp/install_qverse_web.sh
    
    # Run Install Script IN BACKGROUND
    echo "⚡ Starting Server Build on $name..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "chmod +x /tmp/install_qverse_web.sh && nohup /tmp/install_qverse_web.sh > /var/log/qverse_web_launcher.log 2>&1 &"
    
    echo "✅ $name deployment triggered."
done

echo "🎉 Deployment Triggered! (Check logs on server)"
