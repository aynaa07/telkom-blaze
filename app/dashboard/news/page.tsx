'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, ChevronRight, Newspaper, Loader2, Zap, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function UserNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setNews(data);
    setLoading(false);
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-700 bg-black min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-12 relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-[2px] w-8 bg-red-600"></div>
          <span className="text-red-600 text-[10px] uppercase font-black tracking-[0.5em] animate-pulse">Live Feed</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white italic">
          BLAZE <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">JOURNAL</span>
        </h1>
        <p className="text-zinc-600 text-[9px] uppercase font-black mt-4 tracking-[0.3em] flex items-center gap-2">
           <Zap size={12} className="text-red-600 fill-red-600" /> Tactical Intelligence & Team Updates
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-red-600 mb-6" size={40} />
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em]">Syncing Feed...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {news.map((item) => (
            /* DIBUNGKUS LINK AGAR BISA DIKLIK */
            <Link 
              key={item.id} 
              href={`/dashboard/news/${item.id}`}
              className="group relative bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-red-600/50 transition-all duration-700 flex flex-col shadow-2xl hover:shadow-red-600/10 cursor-pointer"
            >
              {/* IMAGE SECTION */}
              <div className="relative aspect-[16/11] overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt="" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-in-out opacity-40 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                <div className="absolute top-6 left-6">
                  <div className="bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-widest italic group-hover:scale-110 transition-transform">
                    Breaking
                  </div>
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div className="p-8 flex flex-col flex-1 relative -mt-8 bg-zinc-950 rounded-t-[2.5rem] border-t border-zinc-900 group-hover:border-red-600/30 transition-all duration-700">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-4 bg-red-600"></div>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long' })}
                  </span>
                </div>
                
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-100 group-hover:text-red-600 transition-all mb-4 line-clamp-2 leading-[1.1]">
                  {item.title}
                </h3>
                
                <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-3 mb-8 font-medium uppercase tracking-tight">
                  {item.content}
                </p>

                {/* FOOTER CARD */}
                <div className="mt-auto flex justify-between items-center pt-6 border-t border-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Read Intel</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-xl">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {news.length === 0 && (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
              <p className="text-zinc-800 text-[11px] uppercase font-black tracking-[0.5em] italic">Sector Empty // No Intel Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}