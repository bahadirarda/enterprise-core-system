-- HRMS Admin Role Debug Script
-- Bu SQL sorgusu ile kullanıcı rollerini kontrol edebilirsiniz

-- Mevcut kullanıcı profillerini listele
SELECT 
  id,
  email,
  role,
  created_at,
  updated_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Admin yetkisi olan kullanıcıları listele
SELECT 
  id,
  email,
  role,
  created_at
FROM user_profiles 
WHERE role = 'admin' OR role LIKE '%admin%';

-- Belirli bir email için role kontrol et
-- SELECT role FROM user_profiles WHERE email = 'your-email@domain.com';
