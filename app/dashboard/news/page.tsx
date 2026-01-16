'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Newspaper, Clock, ArrowRight, X, 
  Loader2, Zap, Calendar, Maximize2 
} from 'lucide-react';

export default function UserNewsFeed() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Menghubungkan ke Server...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] selection:bg-red-600">
      
      {/* HEADER SECTION */}
      <div className="mb-12 font-['Poppins',sans-serif]">
        <div className="flex items-center gap-3 mb-3 text-red-600">
          <Zap size={16} className="fill-current" />
          <span className="text-[10px] uppercase font-black tracking-[0.4em] italic">Squad Official Bulletin</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
          TEAM <span className="text-red-600 font-light underline decoration-red-600/20 underline-offset-8">NEWS</span>
        </h1>
        <p className="text-zinc-600 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] mt-6 italic leading-none">// Informasi taktis dan kabar terbaru tim</p>
      </div>

      {/* NEWS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {news.length > 0 ? news.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedNews(item)}
            className="group bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-red-600/40 transition-all duration-500 shadow-2xl cursor-pointer flex flex-col h-full"
          >
            {/* THUMBNAIL */}
            <div className="aspect-video w-full overflow-hidden relative">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  alt="News" 
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                  <Newspaper size={40} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} className="text-red-600" />
              </div>
            </div>

            {/* CONTENT PREVIEW */}
            <div className="p-8 flex-1 flex flex-col font-['Poppins',sans-serif]">
              <div className="flex items-center gap-3 mb-4 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                <Calendar size={12} className="text-red-600" />
                {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              
              <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white mb-4 group-hover:text-red-600 transition-colors leading-[1.1]">
                {item.title}
              </h4>
              
              <p className="text-sm text-zinc-500 italic font-['Belleza'] leading-relaxed line-clamp-3 mb-8 font-medium">
                {item.content}
              </p>

              <div className="mt-auto pt-6 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors italic">
                  Baca Selengkapnya
                </span>
                <ArrowRight size={18} className="text-red-600 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
            <Newspaper size={48} className="text-zinc-800 mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada berita terekam.</p>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL (READ MODE) --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-6 bg-black/98 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full h-full md:h-auto md:max-w-4xl md:rounded-[3.5rem] overflow-hidden relative border border-zinc-900 shadow-[0_0_100px_rgba(220,38,38,0.1)] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                  <Zap size={14} className="fill-current" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 font-sans italic">Intel Details</span>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
              {selectedNews.image_url && (
                <img 
                  src={selectedNews.image_url} 
                  className="w-full aspect-video object-cover border-b border-zinc-900 shadow-2xl" 
                  alt="Full News" 
                />
              )}
              
              <div className="p-8 md:p-16">
                <div className="flex items-center gap-4 mb-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans border-l-2 border-red-600 pl-4 italic">
                  <Calendar size={12} />
                  {new Date(selectedNews.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>

                <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter leading-[1.1] mb-10 font-['Poppins',sans-serif]">
                  {selectedNews.title}
                </h2>
                
                <p className="text-zinc-400 text-lg md:text-xl leading-[1.8] font-['Belleza'] whitespace-pre-wrap italic">
                  {selectedNews.content}
                </p>
              </div>
            </div>

            {/* Modal Footer / Close Button for Mobile */}
            <div className="p-6 md:hidden border-t border-zinc-900 bg-black">
              <button 
                onClick={() => setSelectedNews(null)}
                className="w-full bg-zinc-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-500 italic"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}