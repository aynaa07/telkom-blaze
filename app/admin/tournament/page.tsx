'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, X, ChevronDown, Loader2, Search, Check, 
  Users, Eye, Trash2, Clock, MapPin, Edit3
} from 'lucide-react';

type Profile = { id: string; full_name: string; role: string; };
type FormState = {
  id?: string;
  opponent: string; match_type: string; date: string; time: string;
  venue: string; players: Profile[]; officials: Profile[]; coach: Profile | null;
};

export default function AdminTournament() {
  const [matches, setMatches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'review' | 'edit'>('review');
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState<FormState>({
    opponent: '', match_type: 'Tournament', date: '', time: '',
    venue: '', // BERSIH
    players: [], officials: [], coach: null
  });

  useEffect(() => { fetchProfiles(); fetchMatches(); }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('id, full_name, role').order('full_name');
    if (data) setProfiles(data);
  }

  async function fetchMatches() {
    const { data } = await supabase.from('match_schedules').select('*').neq('match_type', 'Training').order('match_date', { ascending: false });
    if (data) setMatches(data);
  }

  const handleReview = (match: any) => {
    const d = new Date(match.match_date);
    setForm({
      id: match.id,
      opponent: match.opponent_name,
      match_type: match.match_type,
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().split(' ')[0].substring(0, 5),
      venue: match.venue,
      players: profiles.filter(p => match.player_team?.includes(p.id)),
      officials: profiles.filter(p => match.official_team?.includes(p.id)),
      coach: profiles.find(p => p.id === match.coach_id) || null
    });
    setViewMode('review');
    setOpen(true);
  };

  async function handleSubmit() {
    if (!form.venue) return alert("MISSION DENIED: Lokasi/Venue wajib diisi!");
    setLoading(true);
    try {
      const localDateTime = new Date(`${form.date}T${form.time}:00`);
      const payload = {
        opponent_name: form.opponent, match_type: form.match_type,
        match_date: localDateTime.toISOString(), venue: form.venue,
        player_team: form.players.map(p => p.id), official_team: form.officials.map(o => o.id),
        coach_id: form.coach?.id, status: 'Upcoming'
      };
      const { error } = form.id 
        ? await supabase.from('match_schedules').update(payload).eq('id', form.id)
        : await supabase.from('match_schedules').insert(payload);
      if (!error) { setOpen(false); fetchMatches(); }
    } catch (err: any) { alert(err.message); }
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-10 text-white min-h-screen bg-black font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-red-600 leading-none">MATCH <span className="text-white">INTEL</span></h1>
        <button onClick={() => { 
          setForm({ opponent: '', match_type: 'Tournament', date: '', time: '', venue: '', players: [], officials: [], coach: null });
          setViewMode('edit'); setOpen(true); 
        }} className="w-full md:w-auto bg-red-600 px-6 py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-600/20">
          <Plus size={16}/> New Deployment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <div key={match.id} onClick={() => handleReview(match)} className="bg-zinc-950 border border-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex justify-between items-center group hover:border-red-600 cursor-pointer transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-zinc-900 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border border-zinc-800 shrink-0">
                <span className="text-[8px] md:text-[10px] font-black text-red-600 uppercase leading-none">{new Date(match.match_date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                <span className="text-lg md:text-xl font-black italic text-white leading-none mt-1">{new Date(match.match_date).toLocaleDateString('id-ID', { day: '2-digit' })}</span>
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-black italic uppercase text-white leading-tight">VS {match.opponent_name}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase italic">
                  <span className="flex items-center gap-1"><MapPin size={10} className="text-red-600"/> {match.venue}</span>
                  <span className="flex items-center gap-1"><Clock size={10} className="text-red-600"/> {new Date(match.match_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} WIB</span>
                </div>
              </div>
            </div>
            <Eye size={18} className="text-zinc-700 group-hover:text-red-600 transition-colors shrink-0" />
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex items-center justify-center md:p-4">
          <div className="w-full h-full md:h-auto md:max-w-4xl bg-zinc-950 md:rounded-[2.5rem] border-x md:border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 z-50"></div>
            <div className="flex justify-between items-center px-6 py-5 md:px-8 md:py-6 border-b border-zinc-900 bg-zinc-950 shrink-0">
              <h2 className="text-base md:text-xl font-black italic uppercase">{viewMode === 'review' ? 'MISSION BRIEF' : 'EDIT MISSION'}</h2>
              <div className="flex items-center gap-3">
                {viewMode === 'review' && (
                  <button onClick={() => setViewMode('edit')} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 hover:text-white transition-colors">
                    <Edit3 size={14}/> Modify
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500"><X size={18} /></button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1 pb-32">
              {viewMode === 'review' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic leading-none">Target Objective</p>
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase text-red-600 leading-none">VS {form.opponent}</h3>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic leading-none">Deployment Schedule</p>
                      <p className="text-base md:text-xl font-black italic uppercase">{form.date} // {form.time} WIB</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                       <p className="text-[8px] font-black text-zinc-600 uppercase mb-2 leading-none">Deployment Venue</p>
                       <p className="text-xs font-black italic uppercase text-white">{form.venue}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic flex items-center gap-2">
                      <Users size={14} className="text-red-600"/> Combatants Deployed ({form.players.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                      {form.players.map(p => (
                        <div key={p.id} className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0"></div>
                          <span className="text-[9px] font-black uppercase italic truncate">{p.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-1.5">
                      <label className="text-[8px] font-black uppercase text-zinc-500 italic ml-1">Opponent</label>
                      <input className="w-full bg-black border border-zinc-800 p-3.5 rounded-xl text-[11px] md:text-sm font-bold focus:border-red-600 outline-none uppercase" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} />
                    </div>
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[8px] font-black uppercase text-zinc-500 italic ml-1">Type</label>
                      <select className="w-full bg-black border border-zinc-800 p-3.5 rounded-xl text-[11px] md:text-sm font-bold focus:border-red-600 outline-none appearance-none" value={form.match_type} onChange={e => setForm({ ...form, match_type: e.target.value })}>
                        <option value="Tournament">Tournament</option><option value="Sparring">Sparring</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-zinc-500 italic">Venue / Location</label>
                    <input className="w-full bg-black border border-zinc-800 p-3.5 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-red-600 placeholder:text-zinc-800" placeholder="INPUT MISSION VENUE..." value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                  </div>
                  <div className="bg-zinc-900/20 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-zinc-900 space-y-4">
                    <SearchDropdown label="Squad Selection" multiple options={profiles} selected={form.players} onChange={(val: Profile[]) => setForm({ ...form, players: val })} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {form.players.map(p => (
                        <div key={p.id} className="bg-black border border-zinc-800 p-2 rounded-lg flex justify-between items-center overflow-hidden">
                          <span className="text-[8px] font-black uppercase italic truncate pr-1">{p.full_name}</span>
                          <button onClick={() => setForm({...form, players: form.players.filter(x => x.id !== p.id)})} className="text-zinc-700 hover:text-red-600 shrink-0"><Trash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <SearchDropdown label="Coach" options={profiles.filter(p => p.role !== 'player')} selected={form.coach ? [form.coach] : []} onChange={(val: Profile[]) => setForm({ ...form, coach: val[0] || null })} />
                      <SearchDropdown label="Officials" multiple options={profiles.filter(p => p.role !== 'player')} selected={form.officials} onChange={(val: Profile[]) => setForm({ ...form, officials: val })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={form.date} className="w-full bg-black border border-zinc-800 p-3.5 rounded-xl text-[10px] font-bold outline-none focus:border-red-600" onChange={e => setForm({ ...form, date: e.target.value })}/>
                      <input type="time" value={form.time} className="w-full bg-black border border-zinc-800 p-3.5 rounded-xl text-[10px] font-bold outline-none focus:border-red-600" onChange={e => setForm({ ...form, time: e.target.value })}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {viewMode === 'edit' && (
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md z-[60]">
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : 'CONFIRM DEPLOYMENT'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}

function SearchDropdown({ label, options, selected, onChange, multiple = false }: any) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: any) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const filtered = options.filter((o: Profile) => o.full_name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-1.5 relative" ref={ref}>
      <label className="text-[8px] font-black text-zinc-600 uppercase italic ml-1 leading-none">{label}</label>
      <div className={`bg-black border p-3.5 rounded-xl cursor-pointer flex justify-between items-center transition-all ${open ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'border-zinc-800'}`} onClick={() => setOpen(!open)}>
        <span className={`text-[10px] font-bold uppercase truncate italic leading-none ${selected.length === 0 ? 'text-zinc-700' : 'text-white'}`}>{selected.length === 0 ? 'Search & Select...' : multiple ? `${selected.length} Selected` : selected[0]?.full_name}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-[1001] w-full bg-zinc-950 border border-zinc-800 rounded-xl mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-zinc-900 bg-zinc-900/50 flex items-center gap-2">
            <Search size={12} className="text-zinc-600" />
            <input autoFocus placeholder="FILTER..." className="w-full bg-transparent text-[10px] outline-none font-bold uppercase text-white" onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-hide">
            {filtered.map((o: Profile) => {
              const active = selected.some((s: Profile) => s.id === o.id);
              return (
                <div key={o.id} onClick={() => { if(multiple) { onChange(active ? selected.filter((s: Profile) => s.id !== o.id) : [...selected, o]); } else { onChange([o]); setOpen(false); } }} 
                  className={`px-4 py-3 cursor-pointer text-[9px] font-bold uppercase flex justify-between items-center transition-colors ${active ? 'bg-red-600 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}>{o.full_name} {active && <Check size={12} />}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}