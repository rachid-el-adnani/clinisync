#!/bin/bash

# CliniSync Railway Deployment Verification Script

echo "🔍 Verifying CliniSync Deployment on Railway"
echo "=============================================="
echo ""

# Your Railway URL
RAILWAY_URL="https://clinisync-production-e3de.up.railway.app"

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$RAILWAY_URL/health")
if [ $? -eq 0 ]; then
  echo "✅ Health check passed"
  echo "   Response: $HEALTH_RESPONSE"
else
  echo "❌ Health check failed"
  exit 1
fi
echo ""

# Test 2: API Root
echo "2️⃣  Testing API Root..."
API_RESPONSE=$(curl -s "$RAILWAY_URL/api")
if [ $? -eq 0 ]; then
  echo "✅ API root accessible"
  echo "   Response: $API_RESPONSE"
else
  echo "❌ API root failed"
  exit 1
fi
echo ""

# Test 3: Check if MySQL variables exist
echo "3️⃣  Checking Railway MySQL Variables..."
railway variables | grep -q "MYSQLHOST"
if [ $? -eq 0 ]; then
  echo "✅ MySQL variables found"
else
  echo "❌ MySQL variables not found - Add MySQL database in Railway dashboard"
  exit 1
fi
echo ""

# Test 4: Login endpoint (should return error without credentials)
echo "4️⃣  Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')
if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo "✅ Login endpoint is working"
  echo "   Response: $LOGIN_RESPONSE"
else
  echo "⚠️  Login endpoint returned an error (expected if DB not initialized yet)"
  echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

echo "=============================================="
echo "🎉 Deployment verification complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. If MySQL variables missing: Add MySQL in Railway dashboard"
echo "   2. Set start command to: npm run start:railway"
echo "   3. Deploy and check logs for database initialization"
echo "   4. Test login: admin@clinisync.com / admin123"
echo ""
echo "🌐 Your API URL: $RAILWAY_URL"
echo "=============================================="

