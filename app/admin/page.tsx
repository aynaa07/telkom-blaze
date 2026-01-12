'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Newspaper, Calendar, ArrowUpRight, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, news: 0, events: 0 });
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // Fetch data secara paralel dari semua tabel
    const [playersRes, newsCountRes, newsDataRes, schedulesRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('schedules').select('*', { count: 'exact', head: true }).gte('date', today) // Hanya hitung jadwal mendatang
    ]);

    setStats({
      players: playersRes.count || 0,
      news: newsCountRes.count || 0,
      events: schedulesRes.count || 0 // Sekarang sudah terhubung ke tabel schedules
    });
    
    setRecentNews(newsDataRes.data || []);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Booting Command Center...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 bg-black min-h-screen">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <ShieldAlert className="text-red-600" size={16} />
             <p className="text-zinc-500 text-[10px] tracking-widest uppercase font-bold italic">Operational Status: Online</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            SYSTEM <span className="text-red-600">OVERVIEW</span>
          </h1>
        </div>
        <Link 
          href="/admin/news" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl shadow-red-900/20 flex items-center gap-2"
        >
          <span>+</span> New Announcement
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          icon={<Users size={20}/>} 
          label="Total Squad" 
          value={stats.players} 
          link="/admin/players"
        />
        <StatCard 
          icon={<Newspaper size={20}/>} 
          label="News Broadcasted" 
          value={stats.news} 
          link="/admin/news"
        />
        <StatCard 
          icon={<Calendar size={20}/>} 
          label="Upcoming Missions" 
          value={stats.events} 
          link="/admin/schedule"
        />
      </div>

      {/* RECENT UPDATES SECTION */}
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-red-600"></div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Latest Intel Feed</h2>
          </div>
          <Link href="/admin/news" className="text-[9px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em]">Full Database Access</Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recentNews.length > 0 ? (
            recentNews.map((item) => (
              <div key={item.id} className="group bg-zinc-950 border border-zinc-900 hover:border-red-600/30 p-4 rounded-2xl flex items-center gap-5 transition-all duration-500 shadow-sm shadow-black">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800 group-hover:border-red-600/50 transition-colors">
                  <img 
                    src={item.image_url} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[9px] text-zinc-600 font-black flex items-center gap-1.5 uppercase tracking-widest">
                      <Clock size={10} className="text-red-600" /> 
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <Link href="/admin/news" className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl text-zinc-700 hover:text-white hover:bg-red-600 transition-all">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            ))
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
              <p className="text-zinc-800 text-[10px] uppercase font-black tracking-widest italic opacity-50">No communication logs found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-20 pt-8 border-t border-zinc-900/30">
        <p className="text-zinc-800 text-[8px] uppercase font-black tracking-[0.6em] italic text-center">
          Secure Tunnel Established // Blaze Core v2.0
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-7 rounded-[2rem] relative group hover:border-red-600/20 transition-all duration-500 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-600/5 blur-[50px] group-hover:bg-red-600/10 transition-all"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="text-red-600 bg-red-600/10 p-3 rounded-2xl border border-red-600/20 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-red-950/20">
          {icon}
        </div>
        <Link href={link} className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg text-zinc-700 hover:text-white hover:bg-zinc-800 transition-all">
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <div>
        <h3 className="text-4xl font-black italic tracking-tighter text-white tabular-nums leading-none">
          {value}
        </h3>
        <p className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.2em] mt-3 italic">
          {label}
        </p>
      </div>
    </div>
  );
}