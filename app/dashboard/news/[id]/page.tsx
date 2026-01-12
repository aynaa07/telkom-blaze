'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Clock, Share2, ShieldCheck, Loader2 } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  async function fetchArticle() {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      router.push('/dashboard/news');
    } else {
      setArticle(data);
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">decrypting intelligence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black animate-in fade-in duration-1000">
      
      {/* HERO SECTION - GAGAH & CINEMATIC */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <img 
          src={article.image_url} 
          className="w-full h-full object-cover" 
          alt="" 
        />
        {/* Overlay Cinematic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Back Button Overlay */}
        <div className="absolute top-8 left-6 md:left-12">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 bg-black/50 backdrop-blur-md border border-zinc-800 p-3 pr-6 rounded-full hover:border-red-600 transition-all"
          >
            <div className="bg-red-600 p-2 rounded-full group-hover:scale-110 transition-transform">
              <ArrowLeft size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Back to Feed</span>
          </button>
        </div>

        {/* Floating Title Overlay */}
        <div className="absolute bottom-12 left-6 md:left-12 right-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-sm italic tracking-widest">
              Strategic Update
            </span>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              <Clock size={12} className="text-red-600" />
              {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.95] drop-shadow-2xl">
            {article.title}
          </h1>
        </div>
      </div>

      {/* ARTICLE CONTENT - COMFORTABLE READING */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Main Body */}
          <div className="flex-grow">
            {/* Divider Merah */}
            <div className="w-12 h-1.5 bg-red-600 mb-10 rounded-full" />
            
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-wrap selection:bg-red-600 selection:text-white uppercase tracking-tight">
              {article.content}
            </p>

            {/* Tactical Footer */}
            <div className="mt-20 pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <ShieldCheck className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase italic tracking-widest leading-none">Blaze HQ Command</p>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase mt-1">Verified Information Provider</p>
                </div>
              </div>
              
              <button className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:border-red-600 transition-all">
                <Share2 size={16} /> Share Intel
              </button>
            </div>
          </div>

          {/* Side Note (Optional Decorative) */}
          <div className="hidden lg:block w-48 shrink-0">
             <div className="sticky top-12 p-6 border border-zinc-900 rounded-3xl bg-zinc-950/50">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] leading-loose mb-4">
                   // Protocol Notice
                </p>
                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic uppercase">
                   Setiap informasi bersifat rahasia untuk internal tim Telkom Blaze.
                </p>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}