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

echo "🚀 Deploying Q-Verse Frontend (Next.js) to Droplets..."

# 1. Prepare Remote Install Script
cat << 'INSTALL_SCRIPT' > scripts/deployment/install_qverse_web.sh
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
INSTALL_SCRIPT

chmod +x scripts/deployment/install_qverse_web.sh

# 2. Deploy Loop
for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "📦 Deploying Frontend to $name ($ip)..."
    
    # Check connection
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "OK" &> /dev/null; then
        echo "⚠️ Skipping $name (Connection failed)"
        continue
    fi

    # Upload Code (Exclude node_modules and .next to save bandwidth/time)
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "rm -rf /tmp/qverse_web_upload && mkdir -p /tmp/qverse_web_upload"
    
    rsync -av -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.next' --exclude '.git' q-verse-web/ "$SSH_USER@$ip":/tmp/qverse_web_upload/
    
    # Upload Install Script
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no scripts/deployment/install_qverse_web.sh "$SSH_USER@$ip":/tmp/install_qverse_web.sh
    
    # Run Install Script
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "chmod +x /tmp/install_qverse_web.sh && /tmp/install_qverse_web.sh"
    
    echo "✅ $name Frontend deployment complete."
done

echo "🎉 Frontend Deployment Finished!"

