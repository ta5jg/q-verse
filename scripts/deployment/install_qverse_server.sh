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
