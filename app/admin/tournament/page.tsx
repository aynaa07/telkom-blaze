'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, X, ChevronDown, Loader2, Search, Check, 
  Users, Eye, Trash2, Clock, MapPin, Edit3, Calendar
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
    venue: '', 
    players: [], officials: [], coach: null
  });

  useEffect(() => { 
    fetchProfiles(); 
    fetchMatches(); 
  }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('id, full_name, role').order('full_name');
    if (data) setProfiles(data);
  }

  async function fetchMatches() {
    const { data, error } = await supabase
      .from('match_schedules')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (data) setMatches(data);
    if (error) console.error("Error fetching matches:", error);
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

  async function handleDelete() {
    if (!form.id) return;
    if (!confirm(`Hapus jadwal pertandingan melawan ${form.opponent}?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('match_schedules').delete().eq('id', form.id);
      if (!error) {
        setOpen(false);
        fetchMatches();
      }
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.opponent || !form.venue || !form.date) return alert("Lengkapi Nama Lawan, Lokasi, dan Tanggal!");
    setLoading(true);
    try {
      const localDateTime = new Date(`${form.date}T${form.time}:00`);
      const payload = {
        opponent_name: form.opponent.toUpperCase(),
        match_type: form.match_type,
        match_date: localDateTime.toISOString(), 
        venue: form.venue.toUpperCase(),
        player_team: form.players.map(p => p.id), 
        official_team: form.officials.map(o => o.id),
        coach_id: form.coach?.id, 
        status: 'Upcoming'
      };
      
      const { error } = form.id 
        ? await supabase.from('match_schedules').update(payload).eq('id', form.id)
        : await supabase.from('match_schedules').insert(payload);
      
      if (!error) { 
        setOpen(false); 
        fetchMatches(); 
      }
    } catch (err: any) { alert(err.message); }
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 font-['Poppins',sans-serif]">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-tight">
            Jadwal <span className="text-red-600">Pertandingan</span>
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-3 font-sans font-bold">
            // SQUAD OPERATIONAL SCHEDULE
          </p>
        </div>
        <button onClick={() => { 
          setForm({ opponent: '', match_type: 'Tournament', date: '', time: '', venue: '', players: [], officials: [], coach: null });
          setViewMode('edit'); setOpen(true); 
        }} className="w-full md:w-auto bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-sans font-bold uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/20">
          <Plus size={16} className="inline mr-2"/> Add Schedule
        </button>
      </div>

      {/* LIST JADWAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <div key={match.id} onClick={() => handleReview(match)} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex justify-between items-center group hover:border-red-600/40 transition-all cursor-pointer shadow-xl">
            <div className="flex items-center gap-6">
              <div className="bg-zinc-900 w-16 h-16 rounded-[1.2rem] flex flex-col items-center justify-center border border-zinc-800 shrink-0 font-['Poppins',sans-serif]">
                <span className="text-[10px] font-bold text-red-600 uppercase">{new Date(match.match_date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                <span className="text-2xl font-bold text-white leading-none mt-1">{new Date(match.match_date).toLocaleDateString('id-ID', { day: '2-digit' })}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase text-white leading-tight font-['Poppins',sans-serif] tracking-tight">{match.opponent_name}</h3>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5 text-[10px] font-bold text-zinc-600 uppercase font-sans tracking-widest">
                  <span className="flex items-center gap-2"><MapPin size={12} className="text-red-600"/> {match.venue}</span>
                  <span className="flex items-center gap-2"><Clock size={12} className="text-red-600"/> {new Date(match.match_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Eye size={20} />
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] md:col-span-2 bg-zinc-950/20">
            <p className="text-zinc-800 uppercase font-bold text-[10px] tracking-[0.5em]">No tactical matches found.</p>
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-950 rounded-[3.5rem] border border-zinc-900 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 z-50 shadow-[0_4px_10px_rgba(220,38,38,0.3)]"></div>
            
            <div className="flex justify-between items-center px-10 py-8 border-b border-zinc-900">
              <h2 className="text-xl font-semibold uppercase tracking-tight font-['Poppins',sans-serif]">
                {viewMode === 'review' ? 'Tactical Review' : 'Operational Setup'}
              </h2>
              <div className="flex items-center gap-4">
                {viewMode === 'review' && (
                  <>
                    <button onClick={handleDelete} disabled={loading} className="p-3 bg-zinc-900/50 text-zinc-700 hover:text-red-600 rounded-2xl transition-all">
                      <Trash2 size={20}/>
                    </button>
                    <button onClick={() => setViewMode('edit')} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
                      <Edit3 size={16} className="inline mr-2"/> Edit Plan
                    </button>
                  </>
                )}
                <button onClick={() => setOpen(false)} className="p-3 rounded-2xl bg-zinc-900 text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
              </div>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto no-scrollbar flex-1 pb-32">
              {viewMode === 'review' ? (
                <div className="space-y-12 animate-in fade-in duration-300 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Target Opponent</p>
                      <h3 className="text-4xl font-bold uppercase text-red-600 font-['Poppins',sans-serif] tracking-tight">{form.opponent}</h3>
                      <div className="inline-block px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">{form.match_type}</div>
                    </div>
                    <div className="md:text-right space-y-2">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Kick-Off Schedule</p>
                      <p className="text-2xl font-semibold uppercase font-['Poppins',sans-serif]">{new Date(form.date).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                      <p className="text-lg font-bold text-zinc-400 italic tracking-widest">{form.time} WIB</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/20 p-8 rounded-[2.5rem] border border-zinc-900 flex items-center gap-8 shadow-inner">
                    <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600"><MapPin size={32}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Battle Ground</p>
                      <p className="text-xl font-bold uppercase text-white font-['Poppins',sans-serif] mt-1 tracking-tight">{form.venue}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-4">
                      <Users size={20} className="text-red-600"/> Selected Squad ({form.players.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {form.players.map(p => (
                        <div key={p.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-red-600/30 transition-all">
                          <div className="w-2 h-2 rounded-full bg-red-600"></div>
                          <span className="text-[11px] font-bold uppercase truncate">{p.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-300 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-3">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">Nama Lawan / Klub</label>
                      <input className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-semibold focus:border-red-600 outline-none uppercase font-['Poppins',sans-serif]" placeholder="E.G. UNIVERSITAS INDONESIA" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} />
                    </div>
                    <div className="md:col-span-4 space-y-3">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">Kategori</label>
                      <select className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-semibold focus:border-red-600 outline-none appearance-none cursor-pointer uppercase" value={form.match_type} onChange={e => setForm({ ...form, match_type: e.target.value })}>
                        <option value="Tournament">Tournament</option><option value="Sparring">Sparring</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">Lokasi Pertandingan</label>
                    <input className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-semibold uppercase outline-none focus:border-red-600 font-['Poppins',sans-serif]" placeholder="E.G. GOR SUMANTRI BRODJONEGORO" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                  </div>

                  <div className="bg-zinc-900/20 p-8 rounded-[3rem] border border-zinc-900 space-y-8">
                    <SearchDropdown label="Select Squad Personnel" multiple options={profiles} selected={form.players} onChange={(val: Profile[]) => setForm({ ...form, players: val })} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {form.players.map(p => (
                        <div key={p.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group shadow-md transition-all hover:border-red-600">
                          <span className="text-[10px] font-bold uppercase truncate pr-3">{p.full_name}</span>
                          <button onClick={() => setForm({...form, players: form.players.filter(x => x.id !== p.id)})} className="text-zinc-800 hover:text-red-600 transition-colors"><X size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SearchDropdown label="Leading Coach" options={profiles.filter(p => p.role !== 'player')} selected={form.coach ? [form.coach] : []} onChange={(val: Profile[]) => setForm({ ...form, coach: val[0] || null })} />
                    <SearchDropdown label="Assigned Officials" multiple options={profiles.filter(p => p.role !== 'player')} selected={form.officials} onChange={(val: Profile[]) => setForm({ ...form, officials: val })} />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">Tanggal Ops</label>
                      <input type="date" value={form.date} className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-semibold outline-none focus:border-red-600 appearance-none font-['Poppins',sans-serif]" onChange={e => setForm({ ...form, date: e.target.value })}/>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">Waktu Launch</label>
                      <input type="time" value={form.time} className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-semibold outline-none focus:border-red-600 appearance-none font-['Poppins',sans-serif]" onChange={e => setForm({ ...form, time: e.target.value })}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {viewMode === 'edit' && (
              <div className="absolute bottom-0 left-0 w-full p-10 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-md z-[60]">
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-[2.5rem] font-sans font-bold uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-red-900/40">
                  {loading ? <Loader2 className="animate-spin" size={24}/> : 'Deploy Tactical Schedule'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
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
    <div className="space-y-3 relative font-sans" ref={ref}>
      <label className="text-[10px] font-bold uppercase text-zinc-600 ml-2 tracking-widest italic">{label}</label>
      <div className={`bg-black border p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${open ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-zinc-800'}`} onClick={() => setOpen(!open)}>
        <span className={`text-[11px] font-bold uppercase truncate ${selected.length === 0 ? 'text-zinc-800' : 'text-white'}`}>
          {selected.length === 0 ? 'Choose Personnel...' : multiple ? `${selected.length} Personnel Selected` : selected[0]?.full_name}
        </span>
        <ChevronDown size={18} className={`text-zinc-600 transition-transform duration-300 ${open ? 'rotate-180 text-red-600' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-[1001] w-full bg-zinc-950 border border-zinc-900 rounded-[2rem] mt-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-zinc-900 bg-zinc-900/50 flex items-center gap-4">
            <Search size={16} className="text-zinc-600" />
            <input autoFocus placeholder="SEARCH NAME..." className="w-full bg-transparent text-[11px] font-bold uppercase text-white outline-none" onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="max-h-72 overflow-y-auto no-scrollbar">
            {filtered.length > 0 ? filtered.map((o: Profile) => {
              const active = selected.some((s: Profile) => s.id === o.id);
              return (
                <div key={o.id} onClick={() => { if(multiple) { onChange(active ? selected.filter((s: Profile) => s.id !== o.id) : [...selected, o]); } else { onChange([o]); setOpen(false); } }} 
                  className={`px-7 py-5 cursor-pointer text-[10px] font-bold uppercase flex justify-between items-center transition-colors border-b border-zinc-900/40 last:border-0 ${active ? 'bg-red-600 text-white' : 'hover:bg-zinc-900 text-zinc-500'}`}>
                  {o.full_name} {active && <Check size={18} strokeWidth={3} />}
                </div>
              );
            }) : (
              <div className="p-8 text-center text-[10px] font-bold text-zinc-800 uppercase italic tracking-[0.2em]">Zero Data Found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}