#!/bin/bash
set -e

# NYC3 Profile/Bashrc Error Fix Script
# Fixes /etc/profile and /root/.bashrc errors related to /usr/bin/.update

echo "🔧 Fixing Profile and Bashrc Errors"
echo "===================================="
echo ""

# 1. Backup original files
echo "1️⃣  Creating backups..."
cp /etc/profile /etc/profile.backup.$(date +%Y%m%d_%H%M%S)
cp /root/.bashrc /root/.bashrc.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backups created"
echo ""

# 2. Check for /usr/bin/.update references
echo "2️⃣  Checking for /usr/bin/.update references..."
echo "In /etc/profile:"
grep -n "/usr/bin/.update" /etc/profile || echo "No references found"
echo ""
echo "In /root/.bashrc:"
grep -n "/usr/bin/.update" /root/.bashrc || echo "No references found"
echo ""

# 3. Remove /usr/bin/.update references from /etc/profile
echo "3️⃣  Fixing /etc/profile..."
if grep -q "/usr/bin/.update" /etc/profile; then
    # Remove lines containing /usr/bin/.update
    sed -i '/\/usr\/bin\/\.update/d' /etc/profile
    echo "✅ Removed /usr/bin/.update references from /etc/profile"
else
    echo "✅ No /usr/bin/.update references found in /etc/profile"
fi
echo ""

# 4. Remove /usr/bin/.update references from /root/.bashrc
echo "4️⃣  Fixing /root/.bashrc..."
if grep -q "/usr/bin/.update" /root/.bashrc; then
    # Remove lines containing /usr/bin/.update
    sed -i '/\/usr\/bin\/\.update/d' /root/.bashrc
    echo "✅ Removed /usr/bin/.update references from /root/.bashrc"
else
    echo "✅ No /usr/bin/.update references found in /root/.bashrc"
fi
echo ""

# 5. Check for syntax errors
echo "5️⃣  Checking for syntax errors..."
bash -n /etc/profile && echo "✅ /etc/profile syntax OK" || echo "⚠️  /etc/profile has syntax errors"
bash -n /root/.bashrc && echo "✅ /root/.bashrc syntax OK" || echo "⚠️  /root/.bashrc has syntax errors"
echo ""

# 6. Check if /usr/bin/.update file exists (should not)
echo "6️⃣  Checking for /usr/bin/.update file..."
if [ -f /usr/bin/.update ]; then
    echo "⚠️  WARNING: /usr/bin/.update file exists!"
    ls -la /usr/bin/.update
    echo "Consider removing it if suspicious"
else
    echo "✅ /usr/bin/.update file does not exist (good)"
fi
echo ""

# 7. Check for other suspicious files in /usr/bin
echo "7️⃣  Checking for other suspicious files in /usr/bin..."
find /usr/bin -name ".*" -type f 2>/dev/null | head -10
echo ""

# 8. Verify fixes
echo "8️⃣  Verifying fixes..."
echo "Testing /etc/profile:"
bash -c "source /etc/profile" && echo "✅ /etc/profile loads without errors" || echo "⚠️  /etc/profile still has errors"
echo ""
echo "Testing /root/.bashrc:"
bash -c "source /root/.bashrc" && echo "✅ /root/.bashrc loads without errors" || echo "⚠️  /root/.bashrc still has errors"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Profile/Bashrc fix completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "1. Open a new SSH session to verify errors are gone"
echo "2. Check for other malware indicators"
echo "3. Review system logs for suspicious activity"
echo "4. Apply full security hardening"
