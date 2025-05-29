#!/bin/bash

# HRMS System Startup Script
echo "🚀 HRMS System Başlatılıyor..."

# .env.ports dosyasını oku
envfile=".env.ports"
if [ -f "$envfile" ]; then
  export $(grep -v '^#' $envfile | xargs)
else
  echo "❌ $envfile bulunamadı! Çıkılıyor."
  exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  Port $port kullanımda. Mevcut proces sonlandırılıyor..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

start_service() {
    local service_name="$1"
    local workspace="$2"
    local port="$3"
    echo "📱 $service_name başlatılıyor (Port: $port)..."
    check_port $port
    PORT=$port npm run dev --workspace=$workspace > /dev/null 2>&1 &
    local pid=$!
    echo "   PID: $pid"
    sleep 3
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ $service_name başarıyla başlatıldı!"
        echo "   URL: http://localhost:$port"
    else
        echo "❌ $service_name başlatılamadı!"
    fi
    echo
}

# Kill any existing processes
echo "🧹 Mevcut prosesler temizleniyor..."
for port in $AUTH_PORT $PORTAL_PORT $HRMS_PORT $ADMIN_PORT $STATUS_PORT; do
  check_port $port
  sleep 1
done
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start services
echo "🏃‍♂️ Servisler başlatılıyor..."
echo

start_service "Auth App" "apps/auth" $AUTH_PORT
start_service "Portal App" "apps/portal" $PORTAL_PORT
start_service "HRMS App" "apps/hrms" $HRMS_PORT
start_service "Admin Panel" "apps/admin" $ADMIN_PORT
start_service "Status Dashboard" "apps/status" $STATUS_PORT

echo "🎉 Sistem başarıyla başlatıldı!"
echo

# Print URLs
echo "📋 Erişim URL'leri:"
echo "   🔑 Auth App:         http://localhost:$AUTH_PORT"
echo "   🌐 Portal App:       http://localhost:$PORTAL_PORT"
echo "   🏢 HRMS App:         http://localhost:$HRMS_PORT"
echo "   👨‍💼 Admin Panel:      http://localhost:$ADMIN_PORT"
echo "   📊 Status Dashboard:  http://localhost:$STATUS_PORT"
echo

echo "🛑 Sistemi durdurmak için: ./stop.sh"
echo "📊 Durum kontrolü için:    ./status.sh"