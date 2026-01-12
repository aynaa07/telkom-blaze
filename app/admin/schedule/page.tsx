'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, MapPin, Clock, Trophy, 
  Plus, X, Save, Trash2, Loader2, 
  ChevronRight, Search, LayoutGrid, List
} from 'lucide-react';

export default function AdminSchedule() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    opponent_name: '',
    match_date: '',
    venue: 'Gery Futsal',
    match_type: 'Friendly Match',
    status: 'Upcoming'
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    setLoading(true);
    const { data, error } = await supabase
      .from('match_schedules')
      .select('*')
      .order('match_date', { ascending: true });
    
    if (data) setMatches(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('match_schedules')
      .insert([formData]);

    if (!error) {
      setIsAdding(false);
      setFormData({ 
        opponent_name: '', 
        match_date: '', 
        venue: 'Gery Futsal', 
        match_type: 'Friendly Match',
        status: 'Upcoming' 
      });
      fetchSchedules();
    }
    setLoading(false);
  }

  async function deleteMatch(id: string) {
    if (confirm('Deploy deletion protocol for this match?')) {
      const { error } = await supabase
        .from('match_schedules')
        .delete()
        .eq('id', id);
      
      if (!error) fetchSchedules();
    }
  }

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-sans animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
            SCHEDULE <span className="text-red-600">COMMAND</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
            // Manage Squad Deployments & Fixtures
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${
            isAdding ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'
          }`}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancel' : 'New Deployment'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: FORM SECTION */}
        {isAdding && (
          <div className="lg:col-span-4 animate-in slide-in-from-left duration-500">
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] sticky top-24 shadow-2xl">
              <h3 className="text-xs font-black uppercase italic text-white mb-8 flex items-center gap-2">
                <Calendar size={14} className="text-red-600" /> Match Configuration
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Opponent Name</label>
                  <input 
                    required
                    placeholder="e.g. Teknik FC"
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-all uppercase"
                    value={formData.opponent_name}
                    onChange={e => setFormData({...formData, opponent_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Operational Date</label>
                  <input 
                    required
                    type="datetime-local"
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm font-bold focus:border-red-600 outline-none text-white uppercase"
                    value={formData.match_date}
                    onChange={e => setFormData({...formData, match_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Venue / Arena</label>
                  <input 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-all uppercase"
                    value={formData.venue}
                    onChange={e => setFormData({...formData, venue: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-950/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  Deploy Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RIGHT: LIST SECTION */}
        <div className={`${isAdding ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-center">
               <h3 className="text-xs font-black uppercase italic text-zinc-500 tracking-widest flex items-center gap-2">
                <List size={16} className="text-red-600" /> Active Fixtures
              </h3>
              <div className="bg-black border border-zinc-800 px-4 py-2 rounded-xl text-[10px] font-black text-zinc-500">
                TOTAL: {matches.length} MATCHES
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/50 text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] border-b border-zinc-900">
                  <tr>
                    <th className="p-6">Match Info</th>
                    <th className="p-6">Timeline</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {matches.length > 0 ? matches.map((match) => (
                    <tr key={match.id} className="hover:bg-zinc-900/30 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                            <span className="text-[8px] font-black text-red-600 uppercase leading-none mb-1">
                              {new Date(match.match_date).toLocaleDateString('id-ID', { month: 'short' })}
                            </span>
                            <span className="text-lg font-black italic leading-none text-white">
                              {new Date(match.match_date).toLocaleDateString('id-ID', { day: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-black italic text-white uppercase tracking-tight">vs {match.opponent_name}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-1 mt-1">
                              <MapPin size={10} /> {match.venue}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2">
                             <Clock size={12} className="text-red-600" /> 
                             {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                            {match.match_type}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic border ${
                          match.status === 'Finished' 
                          ? 'bg-zinc-900 text-zinc-500 border-zinc-800' 
                          : 'bg-red-600/10 text-red-600 border-red-600/20'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => deleteMatch(match.id)}
                          className="p-3 bg-zinc-900/50 text-zinc-700 hover:text-red-600 hover:bg-red-600/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-zinc-700 font-black italic uppercase text-xs tracking-widest">
                        No operations scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}