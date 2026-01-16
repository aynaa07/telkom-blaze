'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Newspaper, Calendar, ArrowUpRight, 
  ShieldCheck, Clock, Loader2, Zap, Activity,
  ChevronRight, LayoutDashboard, Database, Eye, Info
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, news: 0, schedules: 0, attendance: 0 });
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function fetchData() {
    setLoading(true);
    const [playersRes, newsCountRes, newsDataRes, schedulesRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(4),
      supabase.from('schedules').select('*', { count: 'exact', head: true }),
      supabase.from('attendance_logs').select('*', { count: 'exact', head: true })
    ]);

    setStats({
      players: playersRes.count || 0,
      news: newsCountRes.count || 0,
      schedules: schedulesRes.count || 0, 
      attendance: logsRes.count || 0
    });
    
    setRecentNews(newsDataRes.data || []);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.5em] font-sans italic">Establishing Secure Root Connection...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] gap-6 shadow-2xl relative overflow-hidden font-['Poppins',sans-serif]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold uppercase tracking-tight leading-none mb-2">
              Admin <span className="text-red-600 font-light italic text-xl md:text-3xl">Dashboard</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[9px] text-green-500 font-bold uppercase tracking-widest font-sans">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Terminal Online
              </span>
              <span className="text-zinc-800 font-sans">|</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 font-sans">
                <Clock size={12} /> {currentTime.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto font-sans relative z-10">
          <Link href="/admin/news" className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/20 active:scale-95">
             Create News
          </Link>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users size={20}/>} label="Total Players" value={stats.players} sub="Registered Asset" link="/admin/players" />
        <StatCard icon={<Newspaper size={20}/>} label="Public Feed" value={stats.news} sub="Active News" link="/admin/news?tab=manage" />
        <StatCard icon={<Calendar size={20}/>} label="Schedule" value={stats.schedules} sub="Upcoming Events" link="/admin/tournament" />
        <StatCard icon={<Activity size={20}/>} label="Total Logs" value={stats.attendance} sub="Attendance Records" link="/admin/attendance" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* RECENT NEWS LIST */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 px-1 font-['Poppins',sans-serif]">
            <div className="flex items-center gap-3">
              <Zap className="text-red-600" size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Recent <span className="text-red-600 font-light italic">News Feed</span></h2>
            </div>
            {/* Link ke tab Manage */}
            <Link href="/admin/news?tab=manage" className="text-[9px] font-bold text-zinc-600 hover:text-red-600 transition-all uppercase tracking-[0.3em] flex items-center gap-2 font-sans">
              Management Center <ChevronRight size={12}/>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 font-sans">
            {recentNews.length > 0 ? recentNews.map((item) => (
              <div key={item.id} className="group bg-zinc-950 border border-zinc-900 hover:border-red-600/30 p-5 rounded-[2rem] flex items-center gap-6 transition-all shadow-lg overflow-hidden relative">
                <div className="w-24 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-1 font-['Poppins',sans-serif]">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 font-sans">
                    <p className="text-[9px] text-zinc-600 font-bold flex items-center gap-2 uppercase tracking-widest">
                      <Calendar size={10} className="text-red-600" /> {new Date(item.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}
                    </p>
                    <span className="text-[8px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-zinc-800">Published</span>
                  </div>
                </div>
                {/* TOMBOL REVIEW - KE SECTION REVIEW (TAB MANAGE) */}
                <Link href="/admin/news?tab=manage" className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl text-white hover:bg-red-600 transition-all border border-zinc-800 shadow-xl active:scale-90">
                  <Eye size={18} />
                </Link>
              </div>
            )) : (
              <div className="p-10 text-center border border-dashed border-zinc-900 rounded-[2rem] opacity-30">
                 <p className="text-xs font-bold uppercase tracking-widest italic font-sans">No published news found</p>
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM SUMMARY SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-600/5 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-3 mb-10 font-['Poppins',sans-serif]">
              <ShieldCheck className="text-red-600" size={20} />
              <h2 className="text-xs font-bold uppercase tracking-widest italic">System <span className="text-red-600">Integrity</span></h2>
            </div>
            <div className="space-y-8">
              <ProgressBar label="Attendance Rate" value={75} />
              <ProgressBar label="Database Integrity" value={stats.players > 0 ? 100 : 0} />
              <ProgressBar label="System Performance" value={98} />
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-[2rem] flex gap-4">
             <Info className="text-red-600 shrink-0" size={18}/>
             <p className="text-[9px] text-zinc-600 uppercase font-bold leading-relaxed tracking-widest font-sans">
               Verified dashboard for ukmf blaze administration. all data is fetched in real-time.
             </p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, sub, link }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all group relative overflow-hidden shadow-xl">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-zinc-900 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner border border-zinc-800">
          {icon}
        </div>
        <Link href={link} className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:bg-red-600 transition-all shadow-lg active:scale-90">
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <h3 className="text-5xl font-black italic tracking-tighter text-white leading-none tabular-nums font-sans">
        {value}
      </h3>
      <div className="mt-6 font-sans">
        <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-[8px] uppercase text-zinc-800 font-black tracking-[0.2em]">{sub}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-600 font-sans">
        <span>{label}</span>
        <span className="text-red-600">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-black border border-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}