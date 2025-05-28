#!/bin/bash

# HRMS System Startup Script
echo "🚀 HRMS System Başlatılıyor..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  Port $port kullanımda. Mevcut proces sonlandırılıyor..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local workspace=$2
    local port=$3
    
    echo "📱 $service_name başlatılıyor (Port: $port)..."
    check_port $port
    
    # Start service in background
    npm run dev --workspace=$workspace > /dev/null 2>&1 &
    local pid=$!
    
    echo "   PID: $pid"
    sleep 3
    
    # Check if service started successfully
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
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start services
echo "🏃‍♂️ Servisler başlatılıyor..."
echo

start_service "Admin Panel" "apps/admin" "3003"
start_service "Status Dashboard" "apps/status" "3004"

echo "🎉 Sistem başarıyla başlatıldı!"
echo
echo "📋 Erişim URL'leri:"
echo "   👨‍💼 Admin Panel:      http://localhost:3003"
echo "   📊 Status Dashboard:  http://localhost:3004"
echo
echo "🛑 Sistemi durdurmak için: ./stop.sh"
echo "📊 Durum kontrolü için:    ./status.sh"
echo
echo "⭐ Teams Entegrasyonu Admin Panel'de 'Teams Entegrasyonu' sekmesinde bulunur!" 