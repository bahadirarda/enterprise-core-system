# Microsoft Teams Entegrasyonu

Bu döküman HRMS sistemi için Microsoft Teams entegrasyonunun kurulumu, kullanımı ve yönetimini açıklar.

## 🚀 Özellikler

### ✅ Temel Entegrasyon
- **Teams Bağlantısı**: Organizasyon Teams hesaplarını HRMS sistemine bağlama
- **Kullanıcı Onayı**: Admin onayı ile güvenli bağlantı kurma
- **Durum Takibi**: Bağlantı durumlarının gerçek zamanlı izlenmesi

### 📢 Bildirim Sistemi
- **Pipeline Bildirimleri**: Build başarısızlıkları ve deployment durumları
- **Merge Request Bildirimleri**: Code review gerektiren işlemler
- **Sistem Uyarıları**: Kritik sistem olayları ve güvenlik uyarıları
- **Kanal Yönetimi**: Farklı bildirim türleri için özel kanallar

### ✋ Onay Sistemi
- **Merge Request Onayları**: Teams üzerinden kod onayı workflow'u
- **Deployment Onayları**: Production deployment'ları için onay süreci
- **Feature Flag Onayları**: Özellik açma/kapama onayları
- **Adaptif Kartlar**: Etkileşimli onay kartları ile kolay karar verme

## 🛠️ Kurulum

### 1. Microsoft Azure App Registration

```bash
# 1. Azure Portal'da yeni App Registration oluşturun
# 2. API Permissions ekleyin:
#    - Microsoft Graph API
#    - Team.ReadWrite.All
#    - Channel.ReadWrite.All
#    - ChannelMessage.Send

# 3. Client Secret oluşturun
# 4. Redirect URI ekleyin: https://yourdomain.com/api/auth/callback/teams
```

### 2. Environment Variables

```env
# .env.local dosyasına ekleyin
TEAMS_CLIENT_ID=your_client_id
TEAMS_CLIENT_SECRET=your_client_secret
TEAMS_TENANT_ID=your_tenant_id
TEAMS_REDIRECT_URI=https://yourdomain.com/api/auth/callback/teams
```

### 3. Database Schema

```sql
-- Teams bağlantıları için tablo
CREATE TABLE teams_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  permissions JSONB DEFAULT '[]',
  channel_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  connected_at TIMESTAMP,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teams bildirimleri için tablo
CREATE TABLE teams_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES teams_connections(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(100) NOT NULL,
  teams_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teams onayları için tablo
CREATE TABLE teams_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES teams_connections(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requester VARCHAR(255) NOT NULL,
  approvers JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  estimated_time VARCHAR(50),
  teams_message_id VARCHAR(255),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📖 Kullanım

### Admin Paneli

1. **Teams Entegrasyonu Sekmesi**: Admin panelinde Teams entegrasyonu bölümüne gidin
2. **Bağlantı Ekleme**: "Teams Bağla" butonuna tıklayın
3. **Organizasyon Bilgileri**: Gerekli bilgileri doldurun:
   - Organizasyon Adı
   - Admin E-posta
   - Açıklama (opsiyonel)

### API Kullanımı

#### Bağlantı Oluşturma
```bash
curl -X POST http://localhost:3003/api/teams/connections \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Şirket Adı",
    "adminEmail": "admin@sirket.com",
    "description": "DevOps entegrasyonu için"
  }'
```

#### Bildirim Gönderme
```bash
curl -X POST http://localhost:3003/api/teams/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pipeline_failure",
    "title": "Pipeline Başarısız",
    "message": "Main branch build failed",
    "channel": "#devops"
  }'
```

#### Onay Talebi Oluşturma
```bash
curl -X POST http://localhost:3003/api/teams/approvals \
  -H "Content-Type: application/json" \
  -d '{
    "type": "merge_request",
    "title": "Feature branch merge",
    "description": "New user authentication feature",
    "requester": "developer",
    "approvers": ["tech-lead", "senior-dev"],
    "priority": "high"
  }'
```

## 🔧 Konfigürasyon

### Bildirim Türleri

| Tür | Açıklama | Kanal Önerisi |
|-----|----------|---------------|
| `merge_request` | Code review talepleri | `#development` |
| `pipeline_failure` | Build/test hataları | `#devops` |
| `deployment` | Deployment durumları | `#deployment` |
| `approval_needed` | Manuel onay gerektiren işlemler | `#approvals` |

### Onay Türleri

| Tür | Açıklama | Onaylayanlar |
|-----|----------|--------------|
| `merge_request` | Kod birleştirme onayı | Tech Lead, Senior Developer |
| `deployment` | Production deployment onayı | Product Owner, Tech Lead |
| `feature_flag` | Özellik açma/kapama onayı | Product Manager |

### Adaptif Kart Şablonu

```json
{
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "Merge Request Onayı",
      "weight": "Bolder",
      "size": "Medium"
    },
    {
      "type": "TextBlock",
      "text": "Feature/user-auth branch'i main'e merge edilsin mi?",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        {"title": "Geliştirici:", "value": "john.doe"},
        {"title": "Öncelik:", "value": "Yüksek"},
        {"title": "Tahmini Süre:", "value": "30 dakika"}
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Http",
      "title": "Onayla",
      "method": "POST",
      "url": "/api/teams/approvals/123/approve",
      "style": "positive"
    },
    {
      "type": "Action.Http",
      "title": "Reddet",
      "method": "POST", 
      "url": "/api/teams/approvals/123/reject",
      "style": "destructive"
    }
  ]
}
```

## 🧪 Test Etme

### Test Endpoint'i
```bash
# Test durumunu kontrol et
curl -X GET http://localhost:3003/api/teams/test

# Bildirim testi
curl -X POST http://localhost:3003/api/teams/test \
  -H "Content-Type: application/json" \
  -d '{"testType":"notification"}'

# Onay testi
curl -X POST http://localhost:3003/api/teams/test \
  -H "Content-Type: application/json" \
  -d '{"testType":"approval"}'

# Bağlantı testi
curl -X POST http://localhost:3003/api/teams/test \
  -H "Content-Type: application/json" \
  -d '{"testType":"connection"}'
```

### Manuel Test Adımları

1. **Admin Paneli Test**:
   - http://localhost:3003 adresine gidin
   - Teams Entegrasyonu sekmesine tıklayın
   - Yeni bağlantı oluşturun
   - Bildirimleri ve onayları kontrol edin

2. **API Test**:
   - Yukarıdaki curl komutlarını çalıştırın
   - Response'ları kontrol edin
   - Log'ları takip edin

## 🔒 Güvenlik

### İzinler
- **Minimum İzin Prensibi**: Sadece gerekli Graph API izinleri
- **Token Yönetimi**: Güvenli token saklama ve yenileme
- **Webhook Doğrulama**: Gelen webhook'ların doğrulanması

### Veri Güvenliği
- **Şifreleme**: Hassas verilerin şifrelenmesi
- **Audit Log**: Tüm işlemlerin loglanması
- **Access Control**: Rol tabanlı erişim kontrolü

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **Bağlantı Kurulamıyor**:
   - Azure App Registration ayarlarını kontrol edin
   - Client ID ve Secret'ı doğrulayın
   - Tenant ID'nin doğru olduğundan emin olun

2. **Bildirimler Gönderilmiyor**:
   - Teams webhook URL'ini kontrol edin
   - Kanal izinlerini doğrulayın
   - Rate limiting'e takılmış olabilir

3. **Onaylar Çalışmıyor**:
   - Adaptif kart formatını kontrol edin
   - Action URL'lerinin doğru olduğundan emin olun
   - Teams app permissions'ları kontrol edin

### Log Kontrolü
```bash
# Admin app logları
docker logs hrms-admin

# API logları  
curl http://localhost:3003/api/health
```

## 🔄 Güncelleme ve Bakım

### Düzenli Bakım
- **Token Yenileme**: Access token'ları düzenli olarak yenileyin
- **Bağlantı Durumu**: Bağlantı durumlarını kontrol edin
- **Performans İzleme**: API call'larını ve response time'ları izleyin

### Versiyon Geçişleri
- **Schema Migration**: Veritabanı şeması güncellemeleri
- **API Versioning**: Geriye uyumlu API değişiklikleri
- **Teams App Update**: Teams app manifest güncellemeleri

## 📞 Destek

Sorunlarınız için:
1. Bu dokümantasyonu kontrol edin
2. Log dosyalarını inceleyin
3. Test endpoint'lerini çalıştırın
4. Geliştirme ekibiyle iletişime geçin

---

**Son Güncelleme**: 28 Mayıs 2025
**Versiyon**: 1.0.0
**Maintainer**: HRMS DevOps Team 