// Eğer bir yerde sabit port ile yönlendirme varsa:
// örn: fetch(`http://localhost:8081/api/...`) yerine
// fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/...`)
// veya import ports from '../../../ports.js' ile kullanılabilir