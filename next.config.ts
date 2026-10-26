import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tambahkan IP lokal/jaringan kamu agar Fast Refresh (HMR) tidak diblokir
  allowedDevOrigins: ['192.168.88.225', '10.200.121.128', 'localhost:3000'],
  
  /* opsi konfigurasi lainnya jika ada */
};

export default nextConfig;
