'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Crown, User as UserIcon, TrendingUp, Zap } from 'lucide-react';
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

    if (error) {
      console.error('Error fetching players:', error.message);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { color: 'text-amber-400', border: 'border-amber-400/50', glow: 'shadow-amber-400/40', bg: 'bg-amber-400/5' };
    if (rank === 2) return { color: 'text-zinc-300', border: 'border-zinc-500/30', glow: 'shadow-zinc-500/20', bg: 'bg-zinc-500/5' };
    if (rank === 3) return { color: 'text-orange-500', border: 'border-orange-600/30', glow: 'shadow-orange-600/20', bg: 'bg-orange-600/5' };
    return { color: 'text-zinc-500', border: 'border-zinc-800', glow: '', bg: 'bg-zinc-900/20' };
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Combat Records...</p>
    </div>
  );

  const top3 = players.slice(0, 3);
  const others = players.slice(3);

  // Reorder Top 3 for visual: [Rank 2, Rank 1, Rank 3]
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(p => p !== undefined);

  return (
    <div className="p-4 md:p-12 bg-black min-h-screen pb-32">
      
      {/* HEADER SECTION */}
      <div className="mb-12 md:mb-20 text-center md:text-left mt-4">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
          <div className="h-[2px] w-8 bg-red-600"></div>
          <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em]">Elite Leaderboard</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
          TOP <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">BLAZERS</span>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto">
        {players.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
             <p className="text-zinc-700 text-[10px] uppercase font-black tracking-widest italic">Zero Intelligence Data</p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            
            {/* PODIUM SECTION (Rank 1 In Middle) */}
            <div className="flex items-end justify-center gap-2 md:gap-8 overflow-x-auto md:overflow-visible pb-10 scrollbar-hide snap-x px-4">
              {podiumOrder.map((player) => {
                const rank = player === top3[0] ? 1 : player === top3[1] ? 2 : 3;
                const style = getRankStyle(rank);
                const isRank1 = rank === 1;

                return (
                  <div 
                    key={player.id} 
                    className={`
                      relative shrink-0 transition-all duration-500 snap-center
                      ${isRank1 
                        ? 'w-[180px] md:w-[350px] z-20 order-2' 
                        : rank === 2 ? 'w-[140px] md:w-[300px] z-10 order-1 opacity-70 md:opacity-100' : 'w-[140px] md:w-[300px] z-10 order-3 opacity-70 md:opacity-100'
                      }
                    `}
                  >
                    {/* Podium Card */}
                    <div className={`
                      relative bg-zinc-950 border ${style.border} ${style.glow} ${style.bg}
                      rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 flex flex-col items-center text-center
                      ${isRank1 ? 'md:h-[450px] border-b-4 border-b-amber-400' : 'md:h-[380px] h-[240px]'}
                    `}>
                      
                      {/* Floating Icon */}
                      <div className="absolute -top-4 md:-top-6">
                        {isRank1 ? (
                          <div className="bg-amber-400 p-2 md:p-3 rounded-xl shadow-lg shadow-amber-400/20 rotate-3">
                            <Crown size={20} className="text-black" />
                          </div>
                        ) : (
                          <div className="bg-zinc-800 p-1.5 md:p-2 rounded-lg border border-zinc-700">
                             <span className="text-[10px] font-black italic text-zinc-400 uppercase">#{rank}</span>
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`
                        relative mb-4 md:mb-6 rounded-full border-2 ${style.border} p-1
                        ${isRank1 ? 'w-20 h-20 md:w-32 md:h-32 shadow-2xl shadow-amber-400/10' : 'w-14 h-14 md:w-24 md:h-24'}
                      `}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative">
                           {player.avatar_url ? (
                              <Image src={player.avatar_url} alt={player.full_name} fill className="object-cover" />
                           ) : (
                              <UserIcon size={isRank1 ? 40 : 24} className="text-zinc-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                           )}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className={`font-black italic uppercase tracking-tighter text-white leading-none truncate w-full ${isRank1 ? 'text-lg md:text-2xl mb-1' : 'text-[10px] md:text-lg mb-1'}`}>
                        {player.full_name}
                      </h3>
                      <p className={`font-bold text-zinc-600 uppercase tracking-widest ${isRank1 ? 'text-[8px] md:text-[10px]' : 'text-[6px] md:text-[8px]'}`}>
                        {player.position || 'Elite'} <span className="text-red-600">#{player.back_number || '00'}</span>
                      </p>

                      {/* Score Badge */}
                      <div className={`mt-auto pt-4 md:pt-8 w-full border-t border-zinc-900/50`}>
                        <span className={`font-black italic tabular-nums leading-none ${isRank1 ? 'text-3xl md:text-5xl text-amber-400' : 'text-xl md:text-3xl text-zinc-500'}`}>
                          {player.score || 0}<span className="text-[8px] md:text-[10px] ml-1 opacity-40">PTS</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOWER RANKINGS (4th and below) */}
            <div className="space-y-3 px-2">
              <div className="flex items-center gap-4 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 italic shrink-0 underline decoration-red-600/30 underline-offset-8">Squad Standings</p>
                  <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {others.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="group bg-zinc-950/50 border border-zinc-900 hover:border-zinc-700 p-3 md:p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="w-6 text-center font-black italic text-zinc-800 group-hover:text-red-600 transition-colors text-xs">
                          {index + 4}
                      </span>
                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all shrink-0">
                        {player.avatar_url ? (
                          <Image src={player.avatar_url} alt={player.full_name} fill className="object-cover" />
                        ) : (
                          <UserIcon size={14} className="text-zinc-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <div className="truncate">
                        <h3 className="text-[11px] md:text-sm font-black italic uppercase tracking-tight text-zinc-300 group-hover:text-white transition-colors truncate">{player.full_name}</h3>
                        <p className="text-zinc-700 text-[8px] font-bold uppercase tracking-widest mt-0.5">#{player.back_number || '00'} • {player.position || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-black px-3 py-1.5 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-all shrink-0 ml-2">
                      <span className="font-black italic text-xs md:text-base text-zinc-500 group-hover:text-white tabular-nums">
                        {player.score || 0} <span className="text-[7px] opacity-40 uppercase">pts</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}