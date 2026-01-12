'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Ini untuk email
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Proses Sign In ke Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.identifier,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. CEK ROLE DI DATABASE (Penting agar tahu dia Admin atau bukan)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Jika profile belum dibuat, default ke dashboard biasa
          router.push('/dashboard');
          return;
        }

        // 3. REDIRECT OTOMATIS BERDASARKAN ROLE
        if (profile?.role === 'admin') {
          // Jika status di database 'admin', lempar ke folder /admin
          router.push('/admin');
        } else {
          // Jika status 'user' atau lainnya, lempar ke /dashboard
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      // Pesan error jika email/password salah
      alert('Login Gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 relative overflow-hidden font-sans">
      
      {/* 1. Brand Logo */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="text-2xl font-black italic uppercase tracking-tighter hover:text-red-600 transition-all duration-300">
          TELKOM<span className="text-red-600">BLAZE</span>
        </Link>
      </div>

      {/* Efek Cahaya Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black -z-10"></div>

      <div className="flex-grow flex flex-col justify-center items-center pt-20 pb-10">
        {/* Card Login */}
        <div className="w-full max-w-sm bg-zinc-900/40 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2 text-white">Welcome back</h2>
            <p className="text-zinc-500 text-sm font-light leading-tight tracking-wide">
              Masuk untuk akses sistem anggota Blaze.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                  <User size={18} />
                </span>
                <input 
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-800 font-medium"
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Password</label>
                <Link href="#" className="text-[10px] text-red-600 hover:text-red-500 uppercase font-bold tracking-widest transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                  <Lock size={18} />
                </span>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-800 font-mono"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black py-5 rounded-2xl mt-4 transition-all duration-300 shadow-xl shadow-red-600/20 uppercase italic tracking-tighter text-sm flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div className="text-center mt-10">
            <p className="text-zinc-600 text-[11px] uppercase tracking-widest leading-loose">
              Belum punya akun? <br/>
              <Link href="/register" className="text-red-600 hover:text-red-400 font-bold transition-colors underline underline-offset-8">
                DAFTAR SQUAD SEKARANG
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="w-full text-center px-4 pb-8 relative z-10">
        <p className="text-zinc-800 text-[10px] uppercase tracking-[0.4em] leading-loose max-w-xs md:max-w-md mx-auto font-medium">
          © 2026 Futsal Tukj - Telkom University Kampus Jakarta <br className="hidden md:block"/> All Rights Reserved.
        </p>
      </div>
    </div>
  );
}