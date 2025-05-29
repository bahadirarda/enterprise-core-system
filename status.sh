#!/bin/bash

# HRMS System Status Script
echo "📊 HRMS System Durum Raporu"
echo "=========================="

# Function to check service status
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ $service_name: ÇALIŞIYOR (Port: $port)"
        echo "   URL: $url"
        
        # Try to curl the service
        if curl -s -o /dev/null -w "%{http_code}" $url | grep -q "200"; then
            echo "   Durum: SAĞLIKLI ✅"
        else
            echo "   Durum: YANIT VERMİYOR ⚠️"
        fi
    else
        echo "❌ $service_name: DURMUŞ (Port: $port)"
        echo "   URL: $url"
        echo "   Durum: SERVİS YOK ❌"
    fi
    echo
}

# Check current date/time
echo "🕐 Kontrol Zamanı: $(date)"
echo

# Check services
check_service "Admin Panel" "3003" "http://localhost:3003"
check_service "Status Dashboard" "3004" "http://localhost:3004"

# Check if any Next.js processes are running
next_processes=$(pgrep -f "next dev" | wc -l)
echo "🔧 Çalışan Next.js Prosesleri: $next_processes"

if [ $next_processes -gt 0 ]; then
    echo "📋 Detaylar:"
    pgrep -f "next dev" | while read pid; do
        echo "   PID: $pid"
    done
fi

echo
echo "💡 Komutlar:"
echo "   🚀 Sistemi başlatmak için: ./start.sh"
echo "   🛑 Sistemi durdurmak için: ./stop.sh"
echo "   📊 Bu raporu görmek için: ./status.sh" 