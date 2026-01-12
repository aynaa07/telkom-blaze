'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, Swords, MapPin, Clock, X, Users, 
  ShieldCheck, Star, Target, Zap, ChevronRight, Calendar
} from 'lucide-react';

export default function PlayerSchedule() {
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('match_schedules').select('*, match_reports(*)').order('match_date', { ascending: true }),
      supabase.from('profiles').select('id, full_name, role')
    ]);
    if (mRes.data) setMatches(mRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  }

  // Filter Data
  const upcomingTournaments = matches.filter(m => m.status === 'Upcoming' && m.match_type !== 'Training');
  const upcomingTraining = matches.filter(m => m.status === 'Upcoming' && m.match_type === 'Training');

  // Helper Cari Nama
  const getPlayerName = (id: string) => profiles.find(p => p.id === id)?.full_name || 'Personnel';

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">Syncing Intel...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-sans animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-3">
          MATCH <span className="text-red-600">INTEL</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">// Active Mission & Tactical Schedule</p>
      </div>

      {/* --- SECTION 1: TOURNAMENT & SPARRING (THE CARDS) --- */}
      <section className="mb-16">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-6 flex items-center gap-2 italic">
          <Swords size={16} /> Combat Operations (Matches)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingTournaments.length > 0 ? upcomingTournaments.map((match) => (
            <div 
              key={match.id} 
              onClick={() => setSelectedMatch(match)}
              className="relative group overflow-hidden rounded-[2.5rem] border border-zinc-900 bg-zinc-950 p-8 hover:border-red-600 transition-all cursor-pointer shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-red-600 text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic tracking-widest">
                    {match.match_type}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase italic">Kick Off</p>
                    <p className="text-xl font-black italic">{new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-8">
                  VS <span className="text-red-600">{match.opponent_name}</span>
                </h2>

                <div className="flex flex-wrap gap-6 pt-6 border-t border-zinc-900">
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase italic">
                    <Calendar size={14} className="text-red-600" /> {new Date(match.match_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase italic">
                    <MapPin size={14} className="text-red-600" /> {match.venue}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-2 p-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem] text-center opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest italic">No Combat Missions Deployed</p>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 2: TRAINING DRILLS (THE LIST) --- */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2 italic">
          <Target size={16} /> Tactical Drills (Training)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingTraining.length > 0 ? upcomingTraining.map((drill) => (
            <div key={drill.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex justify-between items-center group hover:bg-zinc-900 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-red-600 transition-colors">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-black italic text-sm uppercase leading-none">Squad Practice</h4>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase mt-2 italic flex items-center gap-1">
                    <MapPin size={10} /> {drill.venue}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-zinc-900 pl-4">
                <p className="text-[11px] font-black italic uppercase leading-none mb-1">
                  {new Date(drill.match_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-[9px] font-bold text-red-600 uppercase italic">
                  {new Date(drill.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )) : (
            <div className="col-span-3 p-6 bg-zinc-950/50 border border-dashed border-zinc-900 rounded-3xl text-center">
              <p className="text-[10px] font-black uppercase text-zinc-700 italic">No drills scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* --- MODAL: MISSION DETAIL (SQUAD LINEUP) --- */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
            <button onClick={() => setSelectedMatch(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>

            <div className="mb-10 text-center">
              <p className="text-red-600 font-black italic text-[10px] tracking-[0.4em] uppercase mb-2">Assignment Briefing</p>
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter italic">VS {selectedMatch.opponent_name}</h2>
            </div>

            <div className="space-y-8">
              {/* STAFF SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Trophy size={10} /> Head Coach
                  </p>
                  <p className="text-[11px] font-black italic uppercase text-white">
                    {selectedMatch.coach_id ? getPlayerName(selectedMatch.coach_id) : 'PENDING'}
                  </p>
                </div>
                <div className="bg-black/50 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ShieldCheck size={10} /> Official Staff
                  </p>
                  <p className="text-[11px] font-black italic uppercase text-white truncate">
                    {selectedMatch.official_team?.length > 0 ? selectedMatch.official_team.map((id:string) => getPlayerName(id)).join(', ') : 'PENDING'}
                  </p>
                </div>
              </div>

              {/* SQUAD SECTION */}
              <div>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                  <Users size={14} className="text-red-600" /> Active Roster Lineup
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-black p-6 rounded-[2.5rem] border border-zinc-900 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {selectedMatch.player_team?.length > 0 ? (
                    selectedMatch.player_team.map((id: string) => (
                      <div key={id} className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                        <span className="text-[11px] font-black uppercase italic text-zinc-200">{getPlayerName(id)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center text-zinc-800 font-black uppercase text-[10px] tracking-widest italic">Squad not yet deployed</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}