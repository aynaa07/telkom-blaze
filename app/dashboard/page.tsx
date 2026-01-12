'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Star, Newspaper, ArrowRight, Clock, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [mvp, setMvp] = useState<any>(null); // State untuk Best Player
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Fetch Profile, News, dan Top Player (MVP) secara paralel
    const [p, n, m] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(2),
      supabase.from('profiles')
        .select('*')
        .order('score', { ascending: false })
        .limit(1)
        .single() // Ambil peringkat 1 saja
    ]);

    setProfile(p.data);
    setNews(n.data || []);
    setMvp(m.data || null);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Loading Tactical Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            PLAYER <span className="text-red-600">DASHBOARD</span>
          </h1>
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
            Selamat bertanding kembali, {profile?.full_name?.split(' ')[0]}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* PLAYER CARD */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
              <User className="absolute -right-6 -top-6 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" size={180} />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-6 overflow-hidden shadow-xl">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Me" />
                  ) : (
                    <User size={32} className="text-zinc-600" />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Official Name</p>
                    <p className="font-black text-xl italic uppercase tracking-tighter line-clamp-1">{profile?.full_name}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Position</p>
                      <p className="text-sm font-black text-red-600 italic">#{profile?.back_number || '00'} {profile?.position || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">NIM</p>
                      <p className="text-sm font-mono font-bold text-zinc-300">{profile?.nim}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BEST PLAYER OF MONTH (CONNECTED TO DB) */}
            <Link href="/dashboard/best-players">
              <div className="bg-gradient-to-br from-zinc-900 to-amber-950/20 border border-amber-900/30 rounded-3xl p-6 relative group cursor-pointer transition-all hover:border-amber-500/50">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="text-amber-500" size={18} />
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Rank #1 Leaderboard</h3>
                </div>
                
                {mvp ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-amber-500 overflow-hidden shrink-0 relative">
                      {mvp.avatar_url ? (
                        <img src={mvp.avatar_url} className="w-full h-full object-cover" alt="MVP" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900"><User size={20} /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-black italic uppercase tracking-tighter text-lg leading-none mb-1 group-hover:text-amber-400 transition-colors">
                        {mvp.full_name}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                        {mvp.position} • {mvp.score} Points
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-600 text-[10px] font-black italic uppercase tracking-widest">Collecting Stats...</p>
                )}
                
                <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={16} className="text-amber-500" />
                </div>
              </div>
            </Link>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-8 space-y-8">
            {/* LATEST NEWS */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 text-red-600">
                  <Newspaper size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Tactical Updates</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.map((item) => (
                  <Link key={item.id} href={`/dashboard/news/${item.id}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-video bg-zinc-900 rounded-2xl mb-4 overflow-hidden border border-zinc-800 relative shadow-2xl">
                        <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent flex items-end p-5">
                          <p className="text-sm font-black italic uppercase tracking-tighter leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{item.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                        <Clock size={12} className="text-red-600" />
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* UPCOMING JADWAL */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-8 px-2 italic">Next Operation</h3>
              <Link href="/dashboard/schedule">
                <div className="group flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-zinc-800 hover:border-red-600/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-zinc-900 rounded-xl flex flex-col items-center justify-center border border-zinc-800 group-hover:bg-red-600 transition-colors">
                      <span className="text-[8px] font-black group-hover:text-white text-red-600">JAN</span>
                      <span className="text-lg font-black italic group-hover:text-white">14</span>
                    </div>
                    <div>
                      <p className="text-sm font-black italic uppercase tracking-tighter group-hover:text-red-600">Tactical & Strategy</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">19:00 - GOR Telkom Jakarta</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}