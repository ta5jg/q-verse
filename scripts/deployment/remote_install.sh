#!/bin/bash
set -e

LOG_FILE="/var/log/qverse_deploy.log"
echo "🚀 Starting Q-Verse Core Deployment at $(date)" > $LOG_FILE

# 1. Install Dependencies
if command -v apt-get &> /dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq pkg-config libssl-dev build-essential psmisc git sqlite3 libsqlite3-dev
fi

# 2. Install Rust
if ! command -v cargo &> /dev/null; then
    echo "🦀 Installing Rust..." >> $LOG_FILE
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    source "$HOME/.cargo/env"
fi

# 3. Update Code
echo "⬇️ Updating Codebase..." >> $LOG_FILE
mkdir -p /opt/q-verse
cd /opt/q-verse

# Check if it's a git repo
if [ -d ".git" ]; then
    git config --global --add safe.directory /opt/q-verse
    git fetch --all >> $LOG_FILE 2>&1
    git reset --hard origin/main >> $LOG_FILE 2>&1
else
    echo "⚠️ Not a git repo, cloning fresh..." >> $LOG_FILE
    cd /opt
    rm -rf q-verse
    git clone https://github.com/ta5jg/q-verse.git q-verse >> $LOG_FILE 2>&1
    cd q-verse
fi

# 4. Build
echo "🔨 Building Release (this takes time)..." >> $LOG_FILE
cargo build --release >> $LOG_FILE 2>&1

# 5. Install Binary
cp target/release/q-verse-core /usr/local/bin/q-verse-core

# 6. Service Setup
cat > /etc/systemd/system/q-verse-core.service <<SERVICE
[Unit]
Description=Q-Verse Core (Quantum-Safe Hybrid Network)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/q-verse
ExecStart=/usr/local/bin/q-verse-core
Restart=always
RestartSec=5
Environment="RUST_LOG=info"
Environment="DATABASE_URL=sqlite:qverse.db?mode=rwc"
Environment="API_HOST=0.0.0.0"
Environment="API_PORT=8080"

[Install]
WantedBy=multi-user.target
SERVICE

# 7. Restart Service
systemctl daemon-reload
systemctl enable q-verse-core
systemctl restart q-verse-core

echo "✅ Deployment Successful at $(date)!" >> $LOG_FILE
