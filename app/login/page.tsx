// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container ini murni mengisi area konten utama di sebelah kanan sidebar
    <div className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans rounded-2xl border border-slate-900 shadow-inner relative overflow-hidden">
      
      {/* Visual Ambient Background Glow di dalam panel saja */}
      <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      
      {/* Subtle Tech Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Kartu Autentikasi Modern (Glassmorphism) */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Kartu */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/10 mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Autentikasi Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Silakan login untuk mengakses halaman monitoring jaringan
          </p>
        </div>

        {/* Alert Banner jika Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 transition-all mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifikasi Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Monitoring</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-3 text-center">
          <p className="text-[11px] text-slate-500">
            Sistem Terproteksi — Akses Khusus Administrator
          </p>
        </div>

      </div>
    </div>
  );
}
