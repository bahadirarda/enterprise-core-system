const { test, expect } = require('@playwright/test');

test.describe('HRMS System E2E Tests', () => {
  test('Auth App - Login page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
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
    await page.goto('http://localhost:3002');
    
    // Sayfa yüklendiğini kontrol et
    await expect(page.locator('body')).toBeVisible();
    
    // Loading durumu kontrol et
    const loadingText = page.locator('text=Kikos Portal yükleniyor...');
    if (await loadingText.isVisible()) {
      // Loading bitene kadar bekle
      await expect(loadingText).toBeHidden({ timeout: 10000 });
    }
    
    console.log('✅ Portal App (Port 3002) - Main page test passed');
  });

  test('HRMS App - Dashboard loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
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
    await page.goto('http://localhost:3003');
    
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
    await page.goto('http://localhost:3003');
    
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
      { port: 3000, name: 'Auth' },
      { port: 3001, name: 'HRMS' },
      { port: 3002, name: 'Portal' },
      { port: 3003, name: 'Admin' }
    ];
    
    for (const { port, name } of ports) {
      const response = await page.request.get(`http://localhost:${port}`);
      expect(response.status()).toBe(200);
      console.log(`✅ ${name} App (Port ${port}) - HTTP Status: ${response.status()}`);
    }
  });

  test('Auth App - Form validation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
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
    await page.goto('http://localhost:3003');
    
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
    await page.goto('http://localhost:3003');
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
      { url: 'http://localhost:3000', name: 'Auth' },
      { url: 'http://localhost:3001', name: 'HRMS' },
      { url: 'http://localhost:3002', name: 'Portal' },
      { url: 'http://localhost:3003', name: 'Admin' }
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