'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, Zap, MapPin, Clock, Calendar } from 'lucide-react';

export default function TrainingPage() {
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDrills(); }, []);

  async function fetchDrills() {
    setLoading(true);
    const { data } = await supabase.from('match_schedules').select('*').eq('match_type', 'Training').order('match_date', { ascending: true });
    if (data) setDrills(data);
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-700 font-black italic uppercase tracking-widest text-xs">Loading Tactical Drills...</div>;

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-sans">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
          TACTICAL <span className="text-zinc-600">DRILLS</span>
        </h1>
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic">// Skill Development & Internal Practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {drills.map((drill) => (
          <div key={drill.id} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 flex flex-col justify-between hover:border-zinc-700 transition-all group">
            <div className="flex justify-between items-start mb-8">
               <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                  <Zap size={24} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-red-600 uppercase italic">Session</p>
                  <p className="text-lg font-black italic">{new Date(drill.match_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
               </div>
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase mb-4">Internal Squad Practice</h3>
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <p className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 italic"><Calendar size={12}/> {new Date(drill.match_date).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'short'})}</p>
                <p className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2 italic"><MapPin size={12}/> {drill.venue}</p>
              </div>
            </div>
          </div>
        ))}
        {drills.length === 0 && <div className="col-span-full py-20 text-center text-zinc-800 font-black italic uppercase text-xs tracking-widest border border-dashed border-zinc-900 rounded-[2rem]">No Training Sessions Scheduled</div>}
      </div>
    </div>
  );
}