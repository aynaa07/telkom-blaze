'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Crown, User as UserIcon, Star, Medal, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function BestPlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestPlayers();
  }, []);

  async function fetchBestPlayers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, position, back_number, score, avatar_url')
      .order('score', { ascending: false });

    if (!error && data) setPlayers(data);
    setLoading(false);
  }

  const top3 = players.slice(0, 3);
  const others = players.slice(3);

  const podiumOrder = [
    { data: top3[1], rank: 2, height: 'h-32 md:h-48', color: 'from-zinc-500/20', border: 'border-zinc-500/50' },
    { data: top3[0], rank: 1, height: 'h-48 md:h-72', color: 'from-amber-500/20', border: 'border-amber-500/50' },
    { data: top3[2], rank: 3, height: 'h-24 md:h-36', color: 'from-orange-700/20', border: 'border-orange-700/50' }
  ].filter(p => p.data !== undefined);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Analyzing Performance...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen font-['Belleza',sans-serif] selection:bg-red-600">
      
      {/* HEADER */}
      <div className="mb-20 text-center font-['Poppins',sans-serif] animate-in fade-in slide-in-from-top duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 mb-4 bg-zinc-900/50">
          <TrendingUp size={12} className="text-red-600" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Season Rankings 2026</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-semibold uppercase tracking-tighter text-white leading-none">
          THE <span className="text-red-600">BEST</span> SQUAD
        </h1>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* LUXURY PODIUM SECTION */}
        <div className="flex items-end justify-center mb-24 gap-3 md:gap-8 px-2 max-w-4xl mx-auto">
          {podiumOrder.map((item) => {
            const isRank1 = item.rank === 1;
            const p = item.data;

            return (
              <div key={p.id} className={`flex flex-col items-center group relative ${isRank1 ? 'w-1/3' : 'w-1/4 opacity-90'}`}>
                
                {/* Avatar Display */}
                <div className="relative mb-6 z-10">
                  <div className={`relative rounded-[2rem] border-2 overflow-hidden bg-zinc-900 shadow-2xl transition-all duration-700 group-hover:scale-105 
                    ${isRank1 ? 'w-24 h-32 md:w-44 md:h-56 border-amber-500 shadow-amber-500/20' : 'w-20 h-28 md:w-36 md:h-48 border-zinc-700 shadow-black'}`}>
                    
                    {/* Rank Glow Backdrop */}
                    {isRank1 && <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />}
                    
                    {p.avatar_url ? (
                      <Image src={p.avatar_url} alt={p.full_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                        <UserIcon size={isRank1 ? 48 : 32} className="text-zinc-800" />
                      </div>
                    )}

                    {/* Overlay Info on Hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-2 md:p-4">
                      <p className="text-[7px] md:text-[9px] font-bold text-zinc-400 uppercase font-sans tracking-widest">{p.position || 'Elite'}</p>
                    </div>
                  </div>
                  
                  {/* Floating Badge */}
                  <div className={`absolute -top-4 -right-4 md:-top-6 md:-right-6 w-10 h-10 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500
                    ${isRank1 ? 'bg-amber-400 text-black' : item.rank === 2 ? 'bg-zinc-300 text-black' : 'bg-orange-700 text-white'}`}>
                    {isRank1 ? <Crown size={24} fill="currentColor" /> : <Medal size={20} fill="currentColor" />}
                  </div>
                </div>

                {/* Pillar / Pedestal */}
                <div className={`relative w-full overflow-hidden rounded-t-[2.5rem] border-x-2 border-t-2 bg-gradient-to-b to-black shadow-2xl transition-all duration-1000 ease-out flex flex-col items-center pt-8
                  ${item.height} ${item.color} ${item.border}`}>
                  
                  {/* Background Large Number */}
                  <span className="absolute -bottom-4 md:-bottom-10 text-[80px] md:text-[180px] font-black text-white/[0.03] italic select-none">
                    {item.rank}
                  </span>

                  {/* Text Container */}
                  <div className="relative z-10 px-2 text-center">
                    <h3 className={`font-bold uppercase tracking-tight text-white leading-tight font-['Poppins',sans-serif] ${isRank1 ? 'text-sm md:text-xl' : 'text-[10px] md:text-sm'}`}>
                      {p.full_name.split(' ')[0]}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                      <Star size={isRank1 ? 14 : 10} className={isRank1 ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'} />
                      <span className={`font-bold tabular-nums ${isRank1 ? 'text-lg md:text-2xl text-amber-400' : 'text-xs md:text-lg text-zinc-400'}`}>
                        {p.score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIST PERINGKAT BAWAH */}
        <div className="space-y-4 max-w-3xl mx-auto px-4 font-sans">
          <div className="flex items-center gap-4 mb-8 opacity-50">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Squad Standings</span>
            <div className="h-px flex-grow bg-zinc-900"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {others.map((player, index) => (
              <div key={player.id} className="group bg-zinc-950/50 border border-zinc-900/80 hover:border-red-600/30 p-4 rounded-[1.5rem] flex items-center justify-between transition-all active:scale-[0.98]">
                <div className="flex items-center gap-5">
                  <span className="w-6 text-center font-black italic text-zinc-800 group-hover:text-red-600 transition-colors text-sm">{index + 4}</span>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-lg">
                    {player.avatar_url ? (
                      <Image src={player.avatar_url} alt={player.full_name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950"><UserIcon size={20} className="text-zinc-800" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-400 group-hover:text-white transition-colors font-['Poppins',sans-serif]">{player.full_name}</h3>
                    <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest mt-1">#{player.back_number || '00'} • {player.position || 'PLAYER'}</p>
                  </div>
                </div>
                <div className="bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-all font-['Belleza',sans-serif]">
                  <span className="font-bold text-lg text-zinc-500 group-hover:text-white tabular-nums">{player.score} <span className="text-[8px] opacity-40 uppercase font-sans">pts</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}