'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, Hash, Phone, Target, GraduationCap } from 'lucide-react'; // Tambahan ikon untuk estetika

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    nim: '',
    prodi: '',
    whatsapp: '',
    position: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Daftarkan Akun ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Simpan data detail ke tabel 'profiles' jika auth berhasil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              nim: formData.nim,
              prodi: formData.prodi,
              whatsapp: formData.whatsapp,
              position: formData.position,
            },
          ]);

        if (profileError) throw profileError;

        alert(`Selamat ${formData.fullName}, pendaftaran Telkom Blaze berhasil!`);
        router.push('/login');
      }
    } catch (error: any) {
      alert('Pendaftaran Gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden font-sans">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="text-2xl font-black italic uppercase tracking-tighter hover:text-red-600 transition-all duration-300">
          TELKOM<span className="text-red-600">BLAZE</span>
        </Link>
      </div>

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black -z-10"></div>

      {/* Registration Card */}
      <div className="w-full max-w-lg bg-zinc-900/40 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Join The Squad</h2>
          <p className="text-zinc-500 text-sm font-light tracking-wide">Lengkapi data diri untuk menjadi bagian dari sejarah.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
              <User size={12} /> Nama Lengkap
            </label>
            <input 
              type="text"
              required
              placeholder="Sesuai KTM"
              className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-700"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          {/* Email & Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <Mail size={12} /> Email
              </label>
              <input 
                type="email"
                required
                placeholder="mhs@telkom.id"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-700 font-mono"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <Lock size={12} /> Password
              </label>
              <input 
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-700"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* NIM & Prodi Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <Hash size={12} /> NIM
              </label>
              <input 
                type="text"
                inputMode="numeric"
                required
                placeholder="1103..."
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-700"
                onChange={(e) => setFormData({...formData, nim: e.target.value.replace(/\D/g, '')})}
                value={formData.nim}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <GraduationCap size={12} /> Prodi
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all text-sm appearance-none text-zinc-400 focus:text-white cursor-pointer"
                  onChange={(e) => setFormData({...formData, prodi: e.target.value})}
                  value={formData.prodi}
                >
                  <option value="" disabled>Pilih Prodi</option>
                  <option value="Teknologi Telekomunikasi">Teknologi Telekomunikasi</option>
                  <option value="Teknologi Informasi">Teknologi Informasi</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Design Komunikasi Visual">Design Komunikasi Visual</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">▼</div>
              </div>
            </div>
          </div>

          {/* WhatsApp & Position Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <Phone size={12} /> WhatsApp
              </label>
              <input 
                type="text"
                inputMode="tel"
                required
                placeholder="0812..."
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all text-sm placeholder:text-zinc-700"
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value.replace(/\D/g, '')})}
                value={formData.whatsapp}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1 flex items-center gap-2">
                <Target size={12} /> Posisi
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all text-sm appearance-none text-zinc-400 focus:text-white cursor-pointer"
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  value={formData.position}
                >
                  <option value="" disabled>Pilih Posisi</option>
                  <option value="GK">GK (Goalkeeper)</option>
                  <option value="Anchor">Anchor</option>
                  <option value="Flank">Flank</option>
                  <option value="Pivot">Pivot</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">▼</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black py-5 rounded-2xl mt-4 transition-all duration-300 shadow-xl shadow-red-600/20 uppercase italic tracking-tighter text-base flex justify-center items-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : 'Kirim Pendaftaran'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-[11px] mt-10 uppercase tracking-widest leading-loose">
          Sudah terdaftar? <Link href="/login" className="text-red-600 hover:text-red-400 font-bold transition-colors underline underline-offset-4">Masuk Sekarang</Link>
        </p>
      </div>

      {/* Footer Text */}
      <div className="mt-16 text-center relative z-10 px-4">
        <p className="text-zinc-700 text-[10px] uppercase tracking-[0.4em] font-medium leading-loose">
          © 2026 Futsal Tukj - Telkom University Kampus Jakarta <br className="hidden md:block"/> All Rights Reserved.
        </p>
      </div>
    </div>
  );
}