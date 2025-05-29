# Test info

- Name: HRMS System E2E Tests >> HRMS App - Dashboard loads correctly
- Location: /Users/bahadirarda/Documents/bahadirarda96@icloud.com/digidaga/hrms-system/tests/e2e-test.spec.js:51:3

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:4002/", waiting until "load"

    at /Users/bahadirarda/Documents/bahadirarda96@icloud.com/digidaga/hrms-system/tests/e2e-test.spec.js:52:16
```

# Page snapshot

```yaml
- paragraph: HRMS yükleniyor...
```

# Test source

```ts
   1 | // E2E Test Suite for HRMS System - Updated with new port configuration (4000-4004)
   2 | require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.ports') });
   3 |
   4 | const PORTAL_PORT = process.env.PORTAL_PORT || 4001;
   5 | const HRMS_PORT = process.env.HRMS_PORT || 4002;
   6 | const ADMIN_PORT = process.env.ADMIN_PORT || 4003;
   7 | const STATUS_PORT = process.env.STATUS_PORT || 4004;
   8 | const AUTH_PORT = process.env.AUTH_PORT || 4000;
   9 |
   10 | const { test, expect } = require('@playwright/test');
   11 |
   12 | test.describe.parallel('HRMS System E2E Tests', () => {
   13 |   test.beforeAll(async () => {
   14 |     console.log('🚀 Starting parallel E2E tests with new port configuration (4000-4004)');
   15 |   });
   16 |
   17 |   test('Auth App - Login page loads correctly', async ({ page }) => {
   18 |     await page.goto(`http://localhost:${AUTH_PORT}`);
   19 |     
   20 |     // Başlık kontrolü
   21 |     await expect(page.locator('[data-slot="card-title"]')).toContainText('Portal Giriş');
   22 |     
   23 |     // Form elemanları kontrolü
   24 |     await expect(page.locator('input[name="email"]')).toBeVisible();
   25 |     await expect(page.locator('input[name="password"]')).toBeVisible();
   26 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
   27 |     
   28 |     // Google ve GitHub butonları
   29 |     await expect(page.locator('button:has-text("Google")')).toBeVisible();
   30 |     await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
   31 |     
   32 |     console.log('✅ Auth App (Port 4000) - Login page test passed');
   33 |   });
   34 |
   35 |   test('Portal App - Main page loads correctly', async ({ page }) => {
   36 |     await page.goto(`http://localhost:${PORTAL_PORT}`);
   37 |     
   38 |     // Sayfa yüklendiğini kontrol et
   39 |     await expect(page.locator('body')).toBeVisible();
   40 |     
   41 |     // Loading durumu kontrol et
   42 |     const loadingText = page.locator('text=Kikos Portal yükleniyor...');
   43 |     if (await loadingText.isVisible()) {
   44 |       // Loading bitene kadar bekle - Portal için daha uzun timeout
   45 |       await expect(loadingText).toBeHidden({ timeout: 15000 });
   46 |     }
   47 |     
   48 |     console.log('✅ Portal App (Port 4001) - Main page test passed');
   49 |   });
   50 |
   51 |   test('HRMS App - Dashboard loads correctly', async ({ page }) => {
>  52 |     await page.goto(`http://localhost:${HRMS_PORT}`);
      |                ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
   53 |     
   54 |     // Sayfa yüklendiğini kontrol et
   55 |     await expect(page.locator('body')).toBeVisible();
   56 |     
   57 |     // Loading durumu kontrol et
   58 |     const loadingText = page.locator('text=HRMS yükleniyor...');
   59 |     if (await loadingText.isVisible()) {
   60 |       // Loading bitene kadar bekle
   61 |       await expect(loadingText).toBeHidden({ timeout: 10000 });
   62 |     }
   63 |     
   64 |     console.log('✅ HRMS App (Port 4002) - Dashboard test passed');
   65 |   });
   66 |
   67 |   test('Admin App - Dashboard loads correctly', async ({ page }) => {
   68 |     await page.goto(`http://localhost:${ADMIN_PORT}`);
   69 |     
   70 |     // Başlık kontrolü
   71 |     await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
   72 |     
   73 |     // Dashboard başlığı
   74 |     await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
   75 |     
   76 |     // Sidebar navigation kontrolleri
   77 |     await expect(page.locator('button:has-text("Şirketler")')).toBeVisible();
   78 |     await expect(page.locator('button:has-text("Kullanıcılar")')).toBeVisible();
   79 |     await expect(page.locator('button:has-text("Sistem Durumu")')).toBeVisible();
   80 |     
   81 |     // Stats kartları yüklenene kadar bekle
   82 |     await page.waitForTimeout(2000);
   83 |     
   84 |     console.log('✅ Admin App (Port 4003) - Dashboard test passed');
   85 |   });
   86 |
   87 |   test('Admin App - Navigation test', async ({ page }) => {
   88 |     await page.goto(`http://localhost:${ADMIN_PORT}`);
   89 |     
   90 |     // Şirketler sayfasına git
   91 |     await page.click('button:has-text("Şirketler")');
   92 |     await page.waitForTimeout(1000);
   93 |     
   94 |     // Kullanıcılar sayfasına git
   95 |     await page.click('button:has-text("Kullanıcılar")');
   96 |     await page.waitForTimeout(1000);
   97 |     
   98 |     // Sistem Durumu sayfasına git
   99 |     await page.click('button:has-text("Sistem Durumu")');
  100 |     await page.waitForTimeout(1000);
  101 |     
  102 |     console.log('✅ Admin App - Navigation test passed');
  103 |   });
  104 |
  105 |   test('System Status Check - All ports respond', async ({ page }) => {
  106 |     const ports = [
  107 |       { port: AUTH_PORT, name: 'Auth' },
  108 |       { port: HRMS_PORT, name: 'HRMS' },
  109 |       { port: PORTAL_PORT, name: 'Portal' },
  110 |       { port: ADMIN_PORT, name: 'Admin' }
  111 |     ];
  112 |     
  113 |     for (const { port, name } of ports) {
  114 |       const response = await page.request.get(`http://localhost:${port}`);
  115 |       expect(response.status()).toBe(200);
  116 |       console.log(`✅ ${name} App (Port ${port}) - HTTP Status: ${response.status()}`);
  117 |     }
  118 |   });
  119 |
  120 |   test('Auth App - Form validation', async ({ page }) => {
  121 |     await page.goto(`http://localhost:${AUTH_PORT}`);
  122 |     
  123 |     // Boş form göndermeyi test et
  124 |     await page.click('button[type="submit"]');
  125 |     
  126 |     // Email alanına geçersiz email gir
  127 |     await page.fill('input[name="email"]', 'invalid-email');
  128 |     await page.fill('input[name="password"]', 'test123');
  129 |     
  130 |     // Form gönder
  131 |     await page.click('button[type="submit"]');
  132 |     
  133 |     console.log('✅ Auth App - Form validation test passed');
  134 |   });
  135 |
  136 |   test('Admin App - System Status Widget', async ({ page }) => {
  137 |     await page.goto(`http://localhost:${ADMIN_PORT}`);
  138 |     
  139 |     // Sistem durumu widget'ının varlığını kontrol et
  140 |     await expect(page.locator('h3:has-text("Sistem Durumu")')).toBeVisible();
  141 |     
  142 |     // Detaylı görünüm linkini kontrol et
  143 |     const statusLink = page.locator('a[href="https://status.kikos.app"]');
  144 |     await expect(statusLink).toBeVisible();
  145 |     await expect(statusLink).toHaveAttribute('target', '_blank');
  146 |     
  147 |     console.log('✅ Admin App - System Status Widget test passed');
  148 |   });
  149 |
  150 |   test('Responsive Design Test', async ({ page }) => {
  151 |     // Desktop test
  152 |     await page.setViewportSize({ width: 1920, height: 1080 });
```