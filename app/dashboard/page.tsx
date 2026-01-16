'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  User, Newspaper, ArrowRight, Clock, 
  Loader2, Trophy, Swords, 
  Zap, MapPin, ChevronRight, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [mvp, setMvp] = useState<any>(null);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const [p, n, m, match] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(2),
      supabase.from('profiles').select('*').order('score', { ascending: false }).limit(1).single(),
      supabase.from('match_schedules').select('*').gte('match_date', new Date().toISOString()).order('match_date', { ascending: true }).limit(1).maybeSingle()
    ]);

    setProfile(p.data);
    setNews(n.data || []);
    setMvp(m.data || null);
    setNextMatch(match.data || null);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse font-sans">Menyiapkan Data Squad...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-['Belleza',sans-serif]">
      <main className="max-w-6xl mx-auto p-4 md:p-10 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <div className="mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-900 pb-10">
          <div className="font-['Poppins',sans-serif]">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-3">
              MY <span className="text-red-600 font-light">STATS</span>
            </h1>
            <p className="text-zinc-600 text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-bold italic font-sans">
              // GAS TERUS, {profile?.full_name?.split(' ')[0]}! JANGAN KASIH KENDOR.
            </p>
          </div>
          <Link href="/player/scan" className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-[1.2rem] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl text-center active:scale-95 font-sans">
             SCAN ABSEN
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* KOLOM KIRI: PROFILE & MVP */}
          <div className="lg:col-span-4 space-y-8 md:space-y-12">
            
            {/* KARTU IDENTITAS */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[100px]"></div>
              
              <div className="relative z-10 font-['Poppins',sans-serif]">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] border-2 border-zinc-800 p-1 overflow-hidden shadow-2xl">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[1.7rem]" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950"><User size={32} className="text-zinc-800" /></div>
                    )}
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black italic text-zinc-900 leading-none tracking-tighter">#{profile?.back_number || '00'}</p>
                     <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1 font-sans">{profile?.position || 'SQUAD'}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="font-bold text-2xl uppercase tracking-tight leading-none mb-2 font-['Poppins',sans-serif]">{profile?.full_name}</h2>
                    <span className="text-[10px] bg-zinc-900 text-zinc-500 px-3 py-1 rounded-lg font-bold uppercase tracking-widest font-sans">NIM {profile?.nim}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-900 pt-8 font-sans">
                    <div className="text-center">
                      <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2 tracking-widest font-sans">Latihan</p>
                      <p className="text-lg font-black italic font-['Poppins',sans-serif]">12<span className="text-xs text-red-600 ml-0.5">X</span></p>
                    </div>
                    <div className="text-center border-x border-zinc-900 font-sans">
                      <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2 tracking-widest font-sans">Tanding</p>
                      <p className="text-lg font-black italic font-['Poppins',sans-serif]">05<span className="text-xs text-red-600 ml-0.5">X</span></p>
                    </div>
                    <div className="text-center font-sans">
                      <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2 tracking-widest font-sans">Poin</p>
                      <p className="text-lg font-black italic font-['Poppins',sans-serif]">{profile?.score || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SI PALING GACOR (RANK #1) */}
            <Link href="/dashboard/best-players" className="block group">
              <div className="bg-zinc-950 border border-amber-900/20 rounded-[2.5rem] p-8 relative transition-all hover:border-amber-500/40 overflow-hidden shadow-2xl active:scale-[0.98]">
                <Trophy className="absolute -right-8 -top-8 text-amber-500/5 rotate-12" size={180} />
                <div className="flex items-center gap-3 mb-8 relative z-10 font-sans">
                  <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500"><Zap size={18} /></div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 italic font-sans leading-none">SI PALING GACOR</h3>
                </div>
                {mvp && (
                  <div className="flex items-center gap-6 relative z-10 font-['Poppins',sans-serif]">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border-2 border-amber-500/50 overflow-hidden p-1 shadow-2xl">
                       <img src={mvp.avatar_url || '/placeholder.png'} className="w-full h-full object-cover rounded-[1.2rem]" alt="MVP" />
                    </div>
                    <div>
                      <p className="font-black italic uppercase tracking-tighter text-xl leading-none group-hover:text-amber-400 transition-colors font-['Poppins',sans-serif]">
                        {mvp.full_name}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 font-sans opacity-70">
                        Peringkat #1 / {mvp.score} Poin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* KOLOM KANAN: BERITA & MISI TEMPUR */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* KABAR SQUAD SECTION */}
            <div className="font-['Poppins',sans-serif]">
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="p-2.5 bg-red-600 rounded-2xl shadow-xl shadow-red-900/40 text-white"><Newspaper size={20} /></div>
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] font-['Poppins',sans-serif]">Kabar Squad</h3>
                <div className="h-px bg-zinc-900 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.map((item) => (
                  <Link key={item.id} href={`/dashboard/news`}>
                    <div className="group cursor-pointer bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-red-600/30 transition-all shadow-2xl">
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <img src={item.image_url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 font-['Poppins',sans-serif]">
                           <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-3 font-sans">
                              <Calendar size={12} className="text-red-600" /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                           </div>
                           <h4 className="text-lg font-bold uppercase tracking-tight leading-tight group-hover:text-red-600 transition-colors font-['Poppins',sans-serif]">{item.title}</h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* MISI TEMPUR (NEXT MATCH) */}
            <div className="font-['Poppins',sans-serif]">
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-red-600 shadow-inner"><Swords size={20} /></div>
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] font-['Poppins',sans-serif]">Misi Tempur</h3>
                <div className="h-px bg-zinc-900 flex-1"></div>
              </div>

              <Link href="/dashboard/match-intel">
                <div className="group flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-900 hover:border-red-600/30 transition-all cursor-pointer relative shadow-2xl overflow-hidden active:scale-[0.98]">
                  <div className="flex items-center gap-8 w-full">
                    <div className="w-16 h-16 bg-zinc-900 rounded-[1.3rem] flex flex-col items-center justify-center border border-zinc-800 group-hover:bg-red-600 transition-all shadow-xl font-['Poppins',sans-serif]">
                      <span className="text-[10px] font-black group-hover:text-white text-red-600 leading-none font-sans uppercase">
                        {nextMatch ? new Date(nextMatch.match_date).toLocaleDateString('id-ID', {month: 'short'}).toUpperCase() : 'N/A'}
                      </span>
                      <span className="text-3xl font-black italic group-hover:text-white mt-1 leading-none">
                        {nextMatch ? new Date(nextMatch.match_date).toLocaleDateString('id-ID', {day: '2-digit'}) : '--'}
                      </span>
                    </div>
                    <div className="flex-1 font-['Poppins',sans-serif]">
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] mb-2 font-sans italic">// Pertandingan Terdekat</p>
                      {/* VS DIHAPUS, MURNI DARI DB */}
                      <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter group-hover:text-red-600 transition-colors leading-none font-['Poppins',sans-serif]">
                        {nextMatch ? nextMatch.opponent_name : 'BELUM ADA JADWAL'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-6 mt-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans opacity-80">
                         <span className="flex items-center gap-2"><MapPin size={14} className="text-red-600" /> {nextMatch?.venue || 'TBA'}</span>
                         <span className="flex items-center gap-2"><Clock size={14} className="text-red-600" /> {nextMatch ? new Date(nextMatch.match_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) : '--:--'} WIB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}