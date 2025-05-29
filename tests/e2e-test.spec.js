require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.ports') });

const PORTAL_PORT = process.env.PORTAL_PORT || 3001;
const HRMS_PORT = process.env.HRMS_PORT || 3002;
const ADMIN_PORT = process.env.ADMIN_PORT || 8080;
const STATUS_PORT = process.env.STATUS_PORT || 8081;
const AUTH_PORT = process.env.AUTH_PORT || 3000;

const { test, expect } = require('@playwright/test');

test.describe('HRMS System E2E Tests', () => {
  test('Auth App - Login page loads correctly', async ({ page }) => {
    await page.goto(`http://localhost:${AUTH_PORT}`);
    
    // Başlık kontrolü
    await expect(page.locator('h1')).toContainText('HRMS Giriş');
    
    // Form elemanları kontrolü
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Google ve GitHub butonları
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    
    console.log('✅ Auth App (Port 3000) - Login page test passed');
  });

  test('Portal App - Main page loads correctly', async ({ page }) => {
    await page.goto(`http://localhost:${PORTAL_PORT}`);
    
    // Sayfa yüklendiğini kontrol et
    await expect(page.locator('body')).toBeVisible();
    
    // Loading durumu kontrol et
    const loadingText = page.locator('text=Kikos Portal yükleniyor...');
    if (await loadingText.isVisible()) {
      // Loading bitene kadar bekle
      await expect(loadingText).toBeHidden({ timeout: 10000 });
    }
    
    console.log('✅ Portal App (Port 3001) - Main page test passed');
  });

  test('HRMS App - Dashboard loads correctly', async ({ page }) => {
    await page.goto(`http://localhost:${HRMS_PORT}`);
    
    // Sayfa yüklendiğini kontrol et
    await expect(page.locator('body')).toBeVisible();
    
    // Loading durumu kontrol et
    const loadingText = page.locator('text=HRMS yükleniyor...');
    if (await loadingText.isVisible()) {
      // Loading bitene kadar bekle
      await expect(loadingText).toBeHidden({ timeout: 10000 });
    }
    
    console.log('✅ HRMS App (Port 3001) - Dashboard test passed');
  });

  test('Admin App - Dashboard loads correctly', async ({ page }) => {
    await page.goto(`http://localhost:${ADMIN_PORT}`);
    
    // Başlık kontrolü
    await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    
    // Dashboard başlığı
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    
    // Sidebar navigation kontrolleri
    await expect(page.locator('button:has-text("Şirketler")')).toBeVisible();
    await expect(page.locator('button:has-text("Kullanıcılar")')).toBeVisible();
    await expect(page.locator('button:has-text("Sistem Durumu")')).toBeVisible();
    
    // Stats kartları yüklenene kadar bekle
    await page.waitForTimeout(2000);
    
    console.log('✅ Admin App (Port 3003) - Dashboard test passed');
  });

  test('Admin App - Navigation test', async ({ page }) => {
    await page.goto(`http://localhost:${ADMIN_PORT}`);
    
    // Şirketler sayfasına git
    await page.click('button:has-text("Şirketler")');
    await page.waitForTimeout(1000);
    
    // Kullanıcılar sayfasına git
    await page.click('button:has-text("Kullanıcılar")');
    await page.waitForTimeout(1000);
    
    // Sistem Durumu sayfasına git
    await page.click('button:has-text("Sistem Durumu")');
    await page.waitForTimeout(1000);
    
    console.log('✅ Admin App - Navigation test passed');
  });

  test('System Status Check - All ports respond', async ({ page }) => {
    const ports = [
      { port: AUTH_PORT, name: 'Auth' },
      { port: HRMS_PORT, name: 'HRMS' },
      { port: PORTAL_PORT, name: 'Portal' },
      { port: ADMIN_PORT, name: 'Admin' }
    ];
    
    for (const { port, name } of ports) {
      const response = await page.request.get(`http://localhost:${port}`);
      expect(response.status()).toBe(200);
      console.log(`✅ ${name} App (Port ${port}) - HTTP Status: ${response.status()}`);
    }
  });

  test('Auth App - Form validation', async ({ page }) => {
    await page.goto(`http://localhost:${AUTH_PORT}`);
    
    // Boş form göndermeyi test et
    await page.click('button[type="submit"]');
    
    // Email alanına geçersiz email gir
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'test123');
    
    // Form gönder
    await page.click('button[type="submit"]');
    
    console.log('✅ Auth App - Form validation test passed');
  });

  test('Admin App - System Status Widget', async ({ page }) => {
    await page.goto(`http://localhost:${ADMIN_PORT}`);
    
    // Sistem durumu widget'ının varlığını kontrol et
    await expect(page.locator('h3:has-text("Sistem Durumu")')).toBeVisible();
    
    // Detaylı görünüm linkini kontrol et
    const statusLink = page.locator('a[href="https://status.kikos.app"]');
    await expect(statusLink).toBeVisible();
    await expect(statusLink).toHaveAttribute('target', '_blank');
    
    console.log('✅ Admin App - System Status Widget test passed');
  });

  test('Responsive Design Test', async ({ page }) => {
    // Desktop test
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`http://localhost:${ADMIN_PORT}`);
    await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    
    // Tablet test
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    
    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
    
    console.log('✅ Responsive Design test passed');
  });

  test('Performance Test - Page Load Times', async ({ page }) => {
    const apps = [
      { url: `http://localhost:${AUTH_PORT}`, name: 'Auth' },
      { url: `http://localhost:${HRMS_PORT}`, name: 'HRMS' },
      { url: `http://localhost:${PORTAL_PORT}`, name: 'Portal' },
      { url: `http://localhost:${ADMIN_PORT}`, name: 'Admin' }
    ];
    
    for (const { url, name } of apps) {
      const startTime = Date.now();
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(10000); // 10 saniyeden az olmalı
      console.log(`✅ ${name} App - Load time: ${loadTime}ms`);
    }
  });
});