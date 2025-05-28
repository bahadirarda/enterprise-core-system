#!/bin/bash

# HRMS System Stop Script
echo "🛑 HRMS System durduruluyor..."

# Kill all Next.js development processes
echo "🧹 Next.js prosesleri sonlandırılıyor..."
pkill -f "next dev" 2>/dev/null || true

# Kill specific ports
echo "📱 Port 3003 (Admin Panel) temizleniyor..."
lsof -ti :3003 | xargs kill -9 2>/dev/null || true

echo "📊 Port 3004 (Status Dashboard) temizleniyor..."
lsof -ti :3004 | xargs kill -9 2>/dev/null || true

echo "⏳ Proseslerin sonlanması bekleniyor..."
sleep 3

# Verify everything is stopped
admin_check=$(lsof -i :3003 2>/dev/null | wc -l)
status_check=$(lsof -i :3004 2>/dev/null | wc -l)

if [ $admin_check -eq 0 ] && [ $status_check -eq 0 ]; then
    echo "✅ Tüm servisler başarıyla durduruldu!"
else
    echo "⚠️  Bazı prosesler hala çalışıyor olabilir. Tekrar deneyin."
fi

echo "🏁 HRMS System durduruldu." 