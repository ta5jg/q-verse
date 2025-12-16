#!/bin/bash
set -e

# Droplets
NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_USER="root"
# Find SSH Key
if [ -f ~/.ssh/id_ed25519 ]; then
    SSH_KEY="~/.ssh/id_ed25519"
elif [ -f ~/.ssh/id_rsa ]; then
    SSH_KEY="~/.ssh/id_rsa"
else
    echo "❌ SSH key not found"
    exit 1
fi
SSH_KEY_PATH=$(eval echo $SSH_KEY)

# Create Install Script content to be run on server
cat << 'INSTALL_SCRIPT' > scripts/deployment/install_qverse_server.sh
#!/bin/bash
set -e

echo "🌌 Installing Q-Verse Core (Quantum-Safe Hybrid Network)..."

# 1. Dependencies
if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq pkg-config libssl-dev build-essential psmisc postgresql postgresql-contrib
fi

# 2. Database (Q-Verse DB)
echo "💾 Configuring PostgreSQL..."
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='qverse_user'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER qverse_user WITH PASSWORD 'quantum_secure_password_CHANGE_THIS';"
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='qverse_db'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE qverse_db OWNER qverse_user;"
fi
DB_URL="postgres://qverse_user:quantum_secure_password_CHANGE_THIS@localhost/qverse_db"

# 3. Rust Setup
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "Rust already installed."
fi
source $HOME/.cargo/env

# 4. Cleanup Old Services
systemctl stop production-api wallet-proxy q-verse-core || true
pkill -9 production-api || true
pkill -9 q-verse-core || true
fuser -k 8080/tcp || true
fuser -k 3001/tcp || true

# 5. Build Q-Verse Core
mkdir -p /opt/q-verse
if [ -d "/tmp/qverse_upload" ]; then
    cp -r /tmp/qverse_upload/* /opt/q-verse/
fi

cd /opt/q-verse
cargo clean
cargo build --release
cp target/release/q-verse-core /usr/local/bin/q-verse-core

# 6. Service Setup
cat > /etc/systemd/system/q-verse-core.service <<SERVICE
[Unit]
Description=Q-Verse Core (Quantum-Safe Hybrid Network)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/usr/local/bin
ExecStart=/usr/local/bin/q-verse-core
Restart=always
RestartSec=5
Environment="RUST_LOG=info"
Environment="PORT=8080"
Environment="DATABASE_URL=${DB_URL}"

[Install]
WantedBy=multi-user.target
SERVICE

# 7. Start Service
systemctl daemon-reload
systemctl enable q-verse-core
systemctl start q-verse-core

# 8. Nginx Update
if command -v nginx &> /dev/null; then
    CONFIGS=$(find /etc/nginx/sites-enabled /etc/nginx/conf.d -name "*.conf")
    for CONFIG in $CONFIGS /etc/nginx/sites-available/default; do
        if [ -f "$CONFIG" ]; then
            # Redirect API traffic to new core
            if grep -q 'location /api/' "$CONFIG"; then
                sed -i 's/localhost:3001/localhost:8080/g' "$CONFIG"
                sed -i 's/localhost:8085/localhost:8080/g' "$CONFIG"
            fi
        fi
    done
    nginx -t && systemctl reload nginx
fi

echo "✅ Q-Verse Core Installed & Running!"
INSTALL_SCRIPT

chmod +x scripts/deployment/install_qverse_server.sh

echo "🚀 Deploying Q-Verse Core to All Droplets"

for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "📦 Deploying to $name ($ip)..."
    
    # Upload Code
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$ip "rm -rf /tmp/qverse_upload && mkdir -p /tmp/qverse_upload/src"
    
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no Cargo.toml $SSH_USER@$ip:/tmp/qverse_upload/
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no src/main.rs $SSH_USER@$ip:/tmp/qverse_upload/src/
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no src/models.rs $SSH_USER@$ip:/tmp/qverse_upload/src/
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no src/crypto.rs $SSH_USER@$ip:/tmp/qverse_upload/src/
    
    # Upload & Run Install Script
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no scripts/deployment/install_qverse_server.sh $SSH_USER@$ip:/tmp/install_qverse.sh
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSH_USER@$ip "chmod +x /tmp/install_qverse.sh && /tmp/install_qverse.sh"
    
    echo "✅ $name deployment complete."
done
