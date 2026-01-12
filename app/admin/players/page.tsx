'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Loader2, User, Trophy, 
  Target, Heart, CalendarCheck, X, Save, 
  ShieldCheck, ShieldAlert, MessageSquare
} from 'lucide-react';

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('score', { ascending: false });
    if (data) setPlayers(data);
    setLoading(false);
  }

  const handleSaveScore = async () => {
    setUpdating(true);
    const finalScore = 
      (Number(selectedPlayer.goals || 0) * 10) + 
      Number(selectedPlayer.attitude_score || 0) + 
      (Number(selectedPlayer.attendance_count || 0) * 5);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        goals: selectedPlayer.goals,
        attitude_score: selectedPlayer.attitude_score,
        attendance_count: selectedPlayer.attendance_count,
        score: finalScore 
      })
      .eq('id', selectedPlayer.id);

    if (!error) {
      fetchPlayers();
      setIsModalOpen(false);
    }
    setUpdating(false);
  };

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if(confirm(`Ubah akses ke ${newRole.toUpperCase()}?`)) {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
      if (!error) fetchPlayers();
    }
  }

  const filtered = players.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.nim?.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
            SQUAD <span className="text-red-600">COMMAND</span>
          </h1>
          <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase mt-2 font-black italic italic">Manage Roles & Performance</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-600" size={14} />
          <input 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="CARI NAMA / NIM..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-11 pr-4 text-[11px] font-bold text-zinc-100 focus:border-red-600 outline-none transition-all uppercase"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>
      ) : (
        <>
          {/* --- TAMPILAN DESKTOP --- */}
          <div className="hidden lg:block bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left text-white">
              <thead className="bg-zinc-900/50 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-zinc-900">
                <tr>
                  <th className="p-6">Squad Member</th>
                  <th className="p-6">Score</th>
                  <th className="p-6 text-center">Authorization</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-all group">
                    <td className="p-6 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <User size={18} className="m-auto mt-2 text-zinc-700" />}
                      </div>
                      <div>
                        <p className="font-black text-sm italic uppercase tracking-tighter">{p.full_name}</p>
                        <p className="text-[10px] text-zinc-600 font-mono italic">{p.position || 'N/A'} • {p.nim}</p>
                      </div>
                    </td>
                    <td className="p-6 font-black italic text-amber-500 text-lg tabular-nums">
                      {p.score || 0}
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleRole(p.id, p.role)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 ${
                          p.role === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {p.role === 'admin' ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                        {p.role === 'admin' ? 'COACH' : 'PLAYER'}
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => { setSelectedPlayer(p); setIsModalOpen(true); }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all"
                      >
                        Assess
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- TAMPILAN HP (FIXED) --- */}
          <div className="lg:hidden space-y-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                    {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-zinc-700" />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-black text-base italic uppercase tracking-tighter text-white leading-none mb-1 truncate w-40">{p.full_name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono italic">#{p.back_number || '00'} • {p.position || 'N/A'}</p>
                  </div>
                  <div className="text-amber-500 font-black italic text-xl tabular-nums">
                    {p.score || 0}
                  </div>
                </div>

                {/* TOMBOL ACTIONS DI HP */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setSelectedPlayer(p); setIsModalOpen(true); }}
                    className="bg-zinc-900 text-zinc-400 py-3.5 rounded-2xl text-[10px] font-black uppercase italic transition-all border border-zinc-800 flex items-center justify-center gap-2"
                  >
                    <Trophy size={14}/> Assess
                  </button>
                  <button 
                    onClick={() => toggleRole(p.id, p.role)}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase italic transition-all ${
                      p.role === 'admin' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                      : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {p.role === 'admin' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                    {p.role === 'admin' ? 'Coach' : 'Grant Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MODAL SCORING --- */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
           <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-[3rem] p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
             <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">{selectedPlayer.full_name}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500"><X size={24}/></button>
             </div>
             
             <div className="space-y-4">
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Target size={10}/> Goals (x10)</span>
                  <input type="number" value={selectedPlayer.goals || 0} onChange={(e) => setSelectedPlayer({...selectedPlayer, goals: parseInt(e.target.value)})} className="w-full bg-transparent text-white font-black italic text-3xl outline-none mt-1"/>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Heart size={10}/> Attitude (0-100)</span>
                  <input type="number" value={selectedPlayer.attitude_score || 0} onChange={(e) => setSelectedPlayer({...selectedPlayer, attitude_score: parseInt(e.target.value)})} className="w-full bg-transparent text-white font-black italic text-3xl outline-none mt-1"/>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1"><CalendarCheck size={10}/> Attendance (x5)</span>
                  <input type="number" value={selectedPlayer.attendance_count || 0} onChange={(e) => setSelectedPlayer({...selectedPlayer, attendance_count: parseInt(e.target.value)})} className="w-full bg-transparent text-white font-black italic text-3xl outline-none mt-1"/>
                </div>
                
                <div className="pt-4 flex justify-between items-center border-t border-zinc-900">
                   <div>
                     <p className="text-[10px] text-zinc-600 font-black uppercase">Calculated Output:</p>
                     <p className="text-3xl font-black italic text-white leading-none">
                       {(selectedPlayer.goals * 10) + (selectedPlayer.attitude_score) + (selectedPlayer.attendance_count * 5)} <span className="text-xs text-red-600">PTS</span>
                     </p>
                   </div>
                   <button onClick={handleSaveScore} disabled={updating} className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 active:scale-95 transition-all">
                     {updating ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Sync
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}