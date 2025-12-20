#!/bin/bash
set -e

echo "🌌 Installing Q-Verse Core (Quantum-Safe Hybrid Network)..." >> /var/log/qverse_install.log

# 1. System Dependencies
if command -v apt-get &> /dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq pkg-config libssl-dev build-essential psmisc postgresql postgresql-contrib
fi

# 2. Database Setup (PostgreSQL)
echo "💾 Configuring PostgreSQL..." >> /var/log/qverse_install.log
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
    echo "🦀 Installing Rust..." >> /var/log/qverse_install.log
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust already installed." >> /var/log/qverse_install.log
    source "$HOME/.cargo/env"
fi

# 4. Cleanup Old Processes
echo "🧹 Cleaning up old processes..." >> /var/log/qverse_install.log
systemctl stop q-verse-core || true
pkill -9 q-verse-core || true
fuser -k 8080/tcp || true

# 5. Build Application
echo "🛠 Building Q-Verse Core..." >> /var/log/qverse_install.log
mkdir -p /opt/q-verse
if [ -d "/tmp/qverse_upload" ]; then
    cp -r /tmp/qverse_upload/* /opt/q-verse/
fi

cd /opt/q-verse
# Ensure Cargo.toml is present before building
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Cargo.toml not found in /opt/q-verse" >> /var/log/qverse_install.log
    exit 1
fi

cargo clean
cargo build --release >> /var/log/qverse_install.log 2>&1

# Install binary
cp target/release/q-verse-core /usr/local/bin/q-verse-core

# 6. Systemd Service Setup
echo "⚙️ Configuring Systemd Service..." >> /var/log/qverse_install.log
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
systemctl restart q-verse-core

echo "✅ Q-Verse Core Successfully Deployed & Running!" >> /var/log/qverse_install.log
