'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, MapPin, Clock, Trash2, Zap, Calendar, Loader2 } from 'lucide-react';

export default function AdminTraining() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    match_date: '', 
    venue: '', // BERSIH
    match_type: 'Training', 
    status: 'Upcoming', 
    opponent_name: 'Internal Practice' 
  });

  useEffect(() => { fetchTrainings(); }, []);

  async function fetchTrainings() {
    setLoading(true);
    const { data } = await supabase.from('match_schedules').select('*').eq('match_type', 'Training').order('match_date', { ascending: true });
    if (data) setTrainings(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.venue) return alert("MISSION DENIED: Lokasi Latihan wajib diisi!");
    setIsSubmitting(true);
    const { error } = await supabase.from('match_schedules').insert([formData]);
    if (!error) {
      setFormData({ ...formData, match_date: '', venue: '' });
      await fetchTrainings();
      alert("Training Mission Deployed!");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans animate-in fade-in duration-500 overflow-x-hidden">
      <div className="mb-8 md:mb-12 mt-2">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">TRAINING <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">DRILLS</span></h1>
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3 italic opacity-70 leading-none">// Squad Technical Enhancement Program</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6 sticky lg:top-24 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white"><Calendar size={18} /></div>
              <h3 className="text-[10px] font-black uppercase italic text-white tracking-[0.2em]">Deployment Config</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Mission Time</label>
                <input type="datetime-local" required className="w-full bg-black border border-zinc-800 p-4 rounded-xl md:rounded-2xl text-white outline-none focus:border-red-600 transition-all uppercase text-[10px] font-bold" value={formData.match_date} onChange={e => setFormData({...formData, match_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Combat Arena</label>
                <input required placeholder="INPUT TRAINING LOCATION..." className="w-full bg-black border border-zinc-800 p-4 rounded-xl md:rounded-2xl text-white outline-none focus:border-red-600 transition-all font-bold text-xs uppercase placeholder:text-zinc-800" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
              </div>
            </div>
            <button disabled={isSubmitting} className="w-full bg-red-600 hover:bg-white hover:text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-zinc-800 italic">
              {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} fill="currentColor"/>}
              Initialize Session
            </button>
          </form>
        </div>

        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-center">
                <div className="flex items-center gap-2"><Target size={18} className="text-red-600" /><p className="text-[10px] font-black text-white uppercase italic tracking-widest">Active Schedule</p></div>
                <span className="text-[8px] font-black text-red-600 italic uppercase bg-red-600/10 px-3 py-1 rounded-full border border-red-600/20">{trainings.length} Missions</span>
            </div>
            <div className="divide-y divide-zinc-900">
              {trainings.length > 0 ? trainings.map(t => (
                <div key={t.id} className="p-6 md:p-8 flex items-center justify-between gap-4 group hover:bg-zinc-900/40 transition-all">
                  <div className="flex items-center gap-4 md:gap-6 w-full">
                    <div className="bg-zinc-900 p-4 rounded-2xl text-red-600 border border-zinc-800 group-hover:bg-red-600 group-hover:text-white transition-all shrink-0"><Target size={24} /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black italic uppercase text-base md:text-xl text-white tracking-tighter leading-tight mb-1 truncate">{new Date(t.match_date).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'short'})}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase italic">
                        <span className="flex items-center gap-1.5 shrink-0"><Clock size={12} className="text-red-600"/> {new Date(t.match_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</span>
                        <span className="flex items-center gap-1.5 truncate"><MapPin size={12} className="text-red-600"/> {t.venue}</span>
                      </div>
                    </div>
                    <button onClick={async () => { if(confirm('Terminate this session?')){ await supabase.from('match_schedules').delete().eq('id', t.id); fetchTrainings(); } }} className="p-3 bg-zinc-900/80 text-zinc-700 hover:text-white hover:bg-red-600 rounded-xl transition-all active:scale-90"><Trash2 size={16}/></button>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                  <div className="p-6 bg-zinc-900/50 rounded-full w-fit mx-auto mb-4 border border-zinc-800"><Target size={32} className="text-zinc-800" /></div>
                  <p className="text-zinc-700 font-black italic uppercase text-[10px] tracking-[0.3em]">Operational Vacuum // Zero Training</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}