# HRMS System

Modern İnsan Kaynakları Yönetim Sistemi - Microsoft Teams entegrasyonu ile gelişmiş bildirim ve onay sistemi

## 🚀 Hızlı Başlangıç

### Sistemi Başlatma
```bash
cd hrms-system
./start.sh
```

### Sistemi Durdurma
```bash
./stop.sh
```

### Durum Kontrolü
```bash
./status.sh
```

## 📱 Erişim URL'leri

- **Admin Panel**: http://localhost:3003
- **Status Dashboard**: http://localhost:3004

## ⭐ Teams Entegrasyonu

Teams entegrasyonu Admin Panel'de **"Teams Entegrasyonu"** sekmesinde bulunur. Bu bölümde:

- 🔗 Teams bağlantılarını yönetebilirsiniz
- 📢 Bildirimleri takip edebilirsiniz
- ✅ Onay süreçlerini yönetebilirsiniz
- ⚙️ Entegrasyon ayarlarını yapılandırabilirsiniz

### Teams Entegrasyonu Özellikleri

1. **Bağlantı Yönetimi**
   - Teams workspace'lerini sisteme bağlama
   - Bağlantı durumu takibi
   - Admin onayı gerektiren güvenli bağlantı süreci

2. **Bildirim Sistemi**
   - Pipeline hatalarında otomatik Teams bildirimi
   - Merge request bildirimleri
   - Deployment durumu bildirimleri
   - Özelleştirilebilir bildirim şablonları

3. **Onay Süreçleri**
   - Teams üzerinden interaktif onay kartları
   - Adaptive Cards ile modern UI
   - Onay geçmişi takibi
   - Otomatik durum güncellemeleri

4. **Test Araçları**
   - Entegrasyon test endpoint'leri
   - Bildirim simülasyonu
   - Bağlantı test araçları
   - Webhook test sistemi

## 🛠️ Geliştirme

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Kurulum
```bash
npm install
```

### Development Ortamı
```bash
# Tüm servisleri başlat
npm run dev

# Sadece admin panel
npm run dev --workspace=apps/admin

# Sadece status dashboard
npm run dev --workspace=apps/status
```

## 📁 Proje Yapısı

```
hrms-system/
├── apps/
│   ├── admin/          # Admin yönetim paneli
│   └── status/         # Sistem durum dashboard'u
├── packages/
│   └── shared/         # Paylaşılan bileşenler
├── supabase/           # Veritabanı şemaları ve migrasyonlar
├── .github/            # CI/CD pipeline'ları
├── start.sh            # Sistem başlatma scripti
├── stop.sh             # Sistem durdurma scripti
├── status.sh           # Durum kontrol scripti
└── TEAMS_INTEGRATION.md # Teams entegrasyonu detaylı dokümantasyonu
```

## 🔧 API Endpoints

### Teams API'leri
- `GET/POST /api/teams/connections` - Teams bağlantıları
- `GET/POST /api/teams/notifications` - Bildirim yönetimi
- `GET/POST /api/teams/approvals` - Onay süreçleri
- `POST /api/teams/test` - Test araçları

## 🚀 Deployment

### CI/CD Pipeline
- **Main branch**: Production deployment
- **Develop branch**: Staging deployment  
- **Feature branches**: Preview deployments + automated tests

### Docker
```bash
docker-compose up -d
```

### Manual Deployment
```bash
./deploy.sh production
```

## 📚 Dokümantasyon

- [Teams Entegrasyonu](./TEAMS_INTEGRATION.md) - Detaylı entegrasyon rehberi
- [API Dokümantasyonu](./docs/api.md) - API referansı
- [Deployment Rehberi](./docs/deployment.md) - Deployment talimatları

## 🔐 Güvenlik

- Teams bağlantıları admin onayı gerektirir
- API endpoint'leri authentication ile korunur
- Webhook imzaları doğrulanır
- Sensitive data encrypt edilir

## 🆘 Destek

Sorun yaşarsanız:

1. `./status.sh` ile sistem durumunu kontrol edin
2. Browser console'da hata mesajlarını kontrol edin
3. `./stop.sh && ./start.sh` ile sistemi yeniden başlatın
4. Sorun devam ederse GitHub Issues'da bildirim yapın

## 📈 Sistem Metrikleri

Admin panel'de aşağıdaki metrikleri takip edebilirsiniz:
- Aktif kullanıcı sayısı
- Teams bağlantı durumları
- Bildirim başarı oranları
- API yanıt süreleri
- Sistem uptime

---

**Not**: Teams entegrasyonu için Microsoft Teams hesabınızda webhook ayarları yapmanız gerekebilir. Detaylı rehber için `TEAMS_INTEGRATION.md` dosyasını inceleyin.
