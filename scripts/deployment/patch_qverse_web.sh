#!/bin/bash
set -e

echo "🔧 Patching Q-Verse Web..." >> /var/log/qverse_patch.log

# Move files
if [ -d "/tmp/qverse_web_upload" ]; then
    cp -r /tmp/qverse_web_upload/app /opt/q-verse-web/
    cp -r /tmp/qverse_web_upload/public /opt/q-verse-web/
fi

cd /opt/q-verse-web

# Rebuild (Incremental - Faster)
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build >> /var/log/qverse_patch.log 2>&1

# Restart PM2
pm2 reload q-verse-web || pm2 start npm --name "q-verse-web" -- start -- -p 3000

echo "✅ Q-Verse Patched!" >> /var/log/qverse_patch.log
