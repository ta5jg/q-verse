#!/bin/bash
# ==============================================
# File:        scripts/deployment/deploy_with_fixes.sh
# Author:      USDTG GROUP TECHNOLOGY LLC
# Developer:   Irfan Gedik
# Created Date: 2025-12-22
# Last Update:  2025-12-22
# Version:     1.0.0
#
# Description:
#   Deploy Q-Verse with Rate Limiting Fixes
#
#   Deploys backend and applies rate limiting fixes to prevent false positives.
#
# License:
#   MIT License
# ==============================================

set -e

echo "🚀 Deploying Q-Verse with Rate Limiting Fixes..."
echo ""

# Deploy backend
echo "📦 Step 1: Deploying Backend..."
bash scripts/deployment/deploy_qverse_core.sh

echo ""
echo "⏳ Waiting 30 seconds for deployment to start..."
sleep 30

# Check deployment status
echo ""
echo "📊 Checking Deployment Status..."
bash scripts/deployment/check_deployment_status.sh

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "  1. Wait 5-10 minutes for build to complete"
echo "  2. Check logs: ssh root@SERVER_IP 'tail -f /var/log/qverse_deploy.log'"
echo "  3. Verify service: ssh root@SERVER_IP 'systemctl status q-verse-core'"
echo "  4. Test API: curl http://SERVER_IP:8080/api/health"
