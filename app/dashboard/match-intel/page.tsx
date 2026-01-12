'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Swords, MapPin, Clock, X, Users, Trophy, 
  ShieldCheck, Calendar, AlertCircle, CheckCircle2, Activity
} from 'lucide-react';

export default function MatchIntelPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => { fetchIntel(); }, []);

  async function fetchIntel() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('match_schedules')
        .select('*, match_reports(*)')
        .neq('match_type', 'Training')
        .order('match_date', { ascending: true }),
      supabase.from('profiles').select('id, full_name')
    ]);
    if (mRes.data) setMatches(mRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  }

  const getMissionStatus = (matchDateString: string, reports: any[]) => {
    const now = new Date();
    const matchDate = new Date(matchDateString);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    
    const diffTime = matchDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (reports && reports.length > 0) {
        return { label: 'FINISHED', color: 'bg-zinc-800 text-zinc-500', icon: <CheckCircle2 size={10}/> };
    }
    if (diffDays === 0) {
        return { label: 'MATCH DAY', color: 'bg-red-600 text-white animate-pulse', icon: <Activity size={10}/> };
    }
    if (diffDays === 1) {
        return { label: 'URGENT: TOMORROW', color: 'bg-amber-500 text-black', icon: <AlertCircle size={10}/> };
    }
    if (now > matchDate) {
        return { label: 'AWAITING RESULT', color: 'bg-zinc-900 text-red-500 border border-red-500/30', icon: <Clock size={10}/> };
    }
    return { label: 'UPCOMING', color: 'bg-zinc-900 text-zinc-400', icon: <Calendar size={10}/> };
  };

  const getPlayerName = (id: string) => profiles.find(p => p.id === id)?.full_name || 'Personnel';

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-600 gap-4">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black italic uppercase tracking-[0.5em] text-[8px] md:text-[10px] animate-pulse">Scanning Combat Missions...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 text-shadow-glow">
            MATCH <span className="text-red-600">INTEL</span>
          </h1>
          <p className="text-zinc-600 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] italic leading-none">// Active Deployment & Tournament Operations</p>
        </div>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {matches.map((match) => {
          const status = getMissionStatus(match.match_date, match.match_reports);
          return (
            <div 
              key={match.id} 
              onClick={() => setSelectedMatch(match)} 
              className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-zinc-900 bg-zinc-950 p-6 md:p-8 hover:border-red-600 transition-all cursor-pointer shadow-2xl active:scale-[0.98]"
            >
              {/* STATUS BADGE - Adjusted for mobile */}
              <div className={`absolute top-0 right-6 md:right-10 px-3 md:px-4 py-1.5 md:py-2 rounded-b-xl md:rounded-b-2xl flex items-center gap-2 font-black italic text-[7px] md:text-[8px] tracking-widest ${status.color} shadow-lg z-20`}>
                {status.icon} {status.label}
              </div>

              <div className="flex justify-between items-start mb-4 md:mb-6 pt-2">
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[7px] md:text-[8px] font-black uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-full italic tracking-widest leading-none">
                  {match.match_type}
                </span>
                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] font-black italic text-white uppercase leading-none bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                    {new Date(match.match_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}
                  </p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8 md:mb-10 group-hover:text-red-600 transition-colors">
                {match.opponent_name}
              </h2>

              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 pt-5 md:pt-6 border-t border-zinc-900 text-[9px] md:text-[10px] font-black uppercase text-zinc-600 italic">
                 <span className="flex items-center gap-2">
                   <MapPin size={12} className="text-red-600 shrink-0" /> <span className="truncate">{match.venue}</span>
                 </span>
                 <span className="flex items-center gap-2">
                   <Clock size={12} className="text-red-600 shrink-0" /> 
                   {new Date(match.match_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', hour12: false})} WIB
                 </span>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem] md:rounded-[3rem] opacity-20 mx-4">
            <p className="text-[10px] font-black uppercase tracking-widest italic">No Mission Intel Available</p>
          </div>
        )}
      </div>

      {/* MODAL MISSION BRIEFING - Fully Responsive */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 bg-black/98 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 w-full md:max-w-2xl h-full md:h-auto md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-50"></div>
            
            <button onClick={() => setSelectedMatch(null)} className="absolute top-6 right-6 md:top-8 md:right-8 text-zinc-500 hover:text-white transition-colors z-[60] bg-zinc-900/50 p-2 rounded-lg">
              <X size={20}/>
            </button>

            <div className="overflow-y-auto scrollbar-hide flex-1 pb-10">
              <div className="mb-8 md:mb-10 text-center mt-10 md:mt-0">
                <p className="text-red-600 font-black italic text-[8px] md:text-[9px] tracking-[0.4em] uppercase mb-3 leading-none underline decoration-red-600/30 underline-offset-4">Assignment Briefing</p>
                <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none px-4">
                  {selectedMatch.opponent_name}
                </h2>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-zinc-900/30 p-4 md:p-5 rounded-2xl border border-zinc-900">
                    <p className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase mb-2 tracking-widest flex items-center gap-1 italic">
                      <Trophy size={10} className="text-red-600"/> Head Coach
                    </p>
                    <p className="text-[10px] md:text-[11px] font-black uppercase italic text-zinc-100">
                      {selectedMatch.coach_id ? getPlayerName(selectedMatch.coach_id) : 'TBA'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/30 p-4 md:p-5 rounded-2xl border border-zinc-900">
                    <p className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase mb-2 tracking-widest flex items-center gap-1 italic">
                      <ShieldCheck size={10} className="text-red-600"/> Tactical Official
                    </p>
                    <p className="text-[10px] md:text-[11px] font-black uppercase italic truncate text-zinc-100">
                      {selectedMatch.official_team?.length > 0 
                        ? selectedMatch.official_team.map((id:string) => getPlayerName(id)).join(', ') 
                        : 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="bg-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-900 shadow-inner">
                  <h4 className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 italic flex items-center gap-2 leading-none">
                    <Users size={14} className="text-red-600" /> Active Roster Lineup ({selectedMatch.player_team?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-h-[350px] md:max-h-[250px] overflow-y-auto scrollbar-hide">
                    {selectedMatch.player_team?.length > 0 ? (
                      selectedMatch.player_team.map((id: string) => (
                        <div key={id} className="flex items-center justify-between p-3.5 md:p-4 bg-zinc-900/50 rounded-xl md:rounded-2xl border border-zinc-800 group hover:border-red-600/50 transition-all">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)] shrink-0" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase italic text-zinc-300 group-hover:text-white transition-colors truncate">
                              {getPlayerName(id)}
                            </span>
                          </div>
                          <Zap size={10} className="text-zinc-800 group-hover:text-red-600 transition-colors shrink-0" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center text-zinc-800 font-black uppercase text-[9px] md:text-[10px] tracking-widest italic">
                        Squad Deployment Pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom button for mobile to close */}
            <button onClick={() => setSelectedMatch(null)} className="md:hidden w-full bg-zinc-900 py-4 font-black uppercase text-[10px] tracking-widest text-zinc-400 rounded-xl mt-4">
              Return to Intelligence
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .text-shadow-glow { text-shadow: 0 0 15px rgba(220, 38, 38, 0.3); }
      `}</style>
    </div>
  );
}

const Zap = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
  </svg>
);