'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Swords, MapPin, Clock, X, Users, Trophy, 
  ShieldCheck, Calendar, AlertCircle, CheckCircle2, Activity, ChevronRight
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

  const getStatusMisi = (matchDateString: string, reports: any[]) => {
    const now = new Date();
    const matchDate = new Date(matchDateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const diffTime = matchDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (reports && reports.length > 0) {
        return { label: 'SELESAI', color: 'bg-zinc-800 text-zinc-500', icon: <CheckCircle2 size={10}/> };
    }
    if (diffDays === 0) {
        return { label: 'HARI INI', color: 'bg-red-600 text-white animate-pulse', icon: <Activity size={10}/> };
    }
    if (diffDays === 1) {
        return { label: 'BESOK TANDING', color: 'bg-amber-500 text-black', icon: <AlertCircle size={10}/> };
    }
    if (now > matchDate) {
        return { label: 'TUNGGU HASIL', color: 'bg-zinc-900 text-red-500 border border-red-500/30', icon: <Clock size={10}/> };
    }
    return { label: 'MENDATANG', color: 'bg-zinc-900 text-zinc-400', icon: <Calendar size={10}/> };
  };

  const getPlayerName = (id: string) => profiles.find(p => p.id === id)?.full_name || 'Personel';

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-600 gap-4 font-sans">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold uppercase tracking-[0.3em] text-[9px] animate-pulse">Memuat Jadwal...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] animate-in fade-in duration-500 pb-20">
      
      {/* HEADER - Ukuran font disesuaikan */}
      <div className="mb-8 md:mb-14 mt-2 md:mt-4 font-['Poppins',sans-serif]">
        <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">
          JADWAL <span className="text-red-600 font-light">TANDING</span>
        </h1>
        <p className="text-zinc-600 text-[8px] md:text-[11px] font-bold uppercase tracking-[0.2em] italic leading-none font-sans">
          // INFORMASI MISI & SQUAD TERPILIH
        </p>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {matches.map((match) => {
          const status = getStatusMisi(match.match_date, match.match_reports);
          return (
            <div 
              key={match.id} 
              onClick={() => setSelectedMatch(match)} 
              className="relative group overflow-hidden rounded-[1.8rem] md:rounded-[2.5rem] border border-zinc-900 bg-zinc-950 p-6 md:p-8 hover:border-red-600/50 transition-all cursor-pointer shadow-2xl active:scale-[0.98]"
            >
              {/* STATUS BADGE - Size disesuaikan */}
              <div className={`absolute top-0 right-6 px-3 py-1.5 rounded-b-xl flex items-center gap-1.5 font-bold italic text-[7px] md:text-[9px] tracking-widest ${status.color} shadow-lg z-20 font-sans uppercase`}>
                {status.icon} {status.label}
              </div>

              <div className="flex justify-between items-start mb-5 pt-1 font-sans">
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-600 text-[7px] md:text-[9px] font-bold uppercase px-3 py-1 rounded-full italic tracking-widest">
                  {match.match_type}
                </span>
                <p className="text-[10px] md:text-xs font-bold italic text-white uppercase bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                  {new Date(match.match_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}
                </p>
              </div>

              {/* Judul Lawan Dinamis */}
              <h2 className="text-2xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-8 group-hover:text-red-600 transition-colors font-['Poppins',sans-serif] italic">
                {match.opponent_name}
              </h2>

              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 pt-5 border-t border-zinc-900/50 text-[9px] md:text-[11px] font-bold uppercase text-zinc-500 italic font-sans">
                 <span className="flex items-center gap-2">
                   <MapPin size={12} className="text-red-600 shrink-0" /> <span className="truncate max-w-[150px] md:max-w-none">{match.venue}</span>
                 </span>
                 <span className="flex items-center gap-2">
                   <Clock size={12} className="text-red-600 shrink-0" /> 
                   {new Date(match.match_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                 </span>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-900 rounded-[2rem] opacity-30">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] font-sans">Belum ada misi tersedia.</p>
          </div>
        )}
      </div>

      {/* MODAL DETAIL - Full Responsive Font */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 w-full md:max-w-xl h-[85vh] md:h-auto md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 z-50"></div>
            
            <button onClick={() => setSelectedMatch(null)} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-zinc-900/50 p-2.5 rounded-xl transition-all active:scale-90 z-[60]">
              <X size={18}/>
            </button>

            <div className="overflow-y-auto no-scrollbar flex-1 pb-6 pt-4">
              <div className="mb-8 text-center font-['Poppins',sans-serif]">
                <p className="text-red-600 font-bold italic text-[8px] md:text-[10px] tracking-[0.3em] uppercase mb-2 font-sans decoration-red-600/20 underline underline-offset-4">Mission Briefing</p>
                <h2 className="text-2xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none">
                  {selectedMatch.opponent_name}
                </h2>
              </div>

              <div className="space-y-5 font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900/50 text-center">
                    <p className="text-[7px] md:text-[8px] font-bold text-zinc-600 uppercase mb-1 tracking-widest italic">Pelatih</p>
                    <p className="text-[10px] md:text-xs font-bold uppercase italic text-zinc-200 truncate">
                      {selectedMatch.coach_id ? getPlayerName(selectedMatch.coach_id) : '-'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900/50 text-center">
                    <p className="text-[7px] md:text-[8px] font-bold text-zinc-600 uppercase mb-1 tracking-widest italic">Official</p>
                    <p className="text-[10px] md:text-xs font-bold uppercase italic text-zinc-200 truncate px-1">
                      {selectedMatch.official_team?.length > 0 ? 'Verified' : 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/20 p-5 md:p-8 rounded-[1.8rem] border border-zinc-900/50">
                  <h4 className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 italic flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Users size={12} className="text-red-600" /> DAFTAR SQUAD ({selectedMatch.player_team?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                    {selectedMatch.player_team?.length > 0 ? (
                      selectedMatch.player_team.map((id: string) => (
                        <div key={id} className="flex items-center justify-between p-3.5 bg-black/40 border border-zinc-900/50 rounded-xl group active:border-red-600/40 transition-all">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                            <span className="text-[10px] md:text-[11px] font-bold uppercase italic text-zinc-400 group-hover:text-white truncate">
                              {getPlayerName(id)}
                            </span>
                          </div>
                          <ChevronRight size={10} className="text-zinc-800" />
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-[9px] text-zinc-700 italic uppercase">Menunggu keputusan coach...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedMatch(null)} className="md:hidden w-full bg-red-600 py-4 font-bold uppercase text-[10px] tracking-widest text-white rounded-xl mt-2 mb-2 active:scale-95 transition-all shadow-lg">
              Kembali
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@800;900&display=swap');
      `}</style>
    </div>
  );
}