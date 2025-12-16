#!/bin/bash
set -e

# Droplets (Assuming these are correct based on user input or previous config)
NYC3_IP="159.203.83.98"
SFO2_IP="157.245.225.95"
FRA1_IP="104.248.251.209"

SSH_USER="root"
# Try to find SSH Key automatically
if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY="$HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
else
    echo "❌ SSH key not found in ~/.ssh/"
    echo "Please ensure you have an SSH key to access your Droplets."
    exit 1
fi

echo "🔑 Using SSH Key: $SSH_KEY"

# Create Install Script to run on remote server
cat << 'INSTALL_SCRIPT' > scripts/deployment/install_qverse_server.sh
#!/bin/bash
set -e

echo "🌌 Installing Q-Verse Core (Quantum-Safe Hybrid Network)..."

# 1. System Dependencies
if command -v apt-get &> /dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq pkg-config libssl-dev build-essential psmisc postgresql postgresql-contrib
fi

# 2. Database Setup (PostgreSQL)
echo "💾 Configuring PostgreSQL..."
# Create user if not exists
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='qverse_user'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER qverse_user WITH PASSWORD 'quantum_secure_password_CHANGE_THIS';"
fi
# Create DB if not exists
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='qverse_db'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE qverse_db OWNER qverse_user;"
fi
DB_URL="postgres://qverse_user:quantum_secure_password_CHANGE_THIS@localhost/qverse_db"

# 3. Rust Installation
if ! command -v cargo &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust already installed."
    source "$HOME/.cargo/env"
fi

# 4. Cleanup Old Processes
echo "🧹 Cleaning up old processes..."
systemctl stop q-verse-core || true
pkill -9 q-verse-core || true
fuser -k 8080/tcp || true

# 5. Build Application
echo "🛠 Building Q-Verse Core..."
mkdir -p /opt/q-verse
if [ -d "/tmp/qverse_upload" ]; then
    cp -r /tmp/qverse_upload/* /opt/q-verse/
fi

cd /opt/q-verse
# Ensure Cargo.toml is present before building
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Cargo.toml not found in /opt/q-verse"
    exit 1
fi

cargo clean
cargo build --release

# Install binary
cp target/release/q-verse-core /usr/local/bin/q-verse-core

# 6. Systemd Service Setup
echo "⚙️ Configuring Systemd Service..."
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
# Important: Set to use Postgres for production if code supports it switch, 
# or ensure SQLite file path is absolute if using SQLite. 
# For this deployment we assume the code will default to SQLite if DATABASE_URL isn't fully used or configured.
# If using SQLite in production, ensure the db file persists.

[Install]
WantedBy=multi-user.target
SERVICE

# 7. Start Service
systemctl daemon-reload
systemctl enable q-verse-core
systemctl restart q-verse-core

echo "✅ Q-Verse Core Successfully Deployed & Running!"
INSTALL_SCRIPT

chmod +x scripts/deployment/install_qverse_server.sh

echo "🚀 Deploying Q-Verse Core to All Droplets..."

for server in "NYC3:$NYC3_IP" "SFO2:$SFO2_IP" "FRA1:$FRA1_IP"; do
    IFS=':' read -r name ip <<< "$server"
    echo "----------------------------------------"
    echo "📦 Deploying to $name ($ip)..."
    
    # Check SSH connectivity first
    if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$ip" echo "SSH Connection OK" &> /dev/null; then
        echo "⚠️  Cannot connect to $name ($ip). Skipping..."
        continue
    fi

    # Upload Code
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "rm -rf /tmp/qverse_upload && mkdir -p /tmp/qverse_upload/src /tmp/qverse_upload/scripts"
    
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no Cargo.toml "$SSH_USER@$ip":/tmp/qverse_upload/
    # Upload src directory recursively
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r src "$SSH_USER@$ip":/tmp/qverse_upload/
    
    # Upload Install Script
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no scripts/deployment/install_qverse_server.sh "$SSH_USER@$ip":/tmp/install_qverse.sh
    
    # Execute Install Script
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ip" "chmod +x /tmp/install_qverse.sh && /tmp/install_qverse.sh"
    
    echo "✅ $name deployment complete."
done

echo "🎉 All deployments finished!"
