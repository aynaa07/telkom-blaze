'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, Zap, MapPin, Clock, Calendar, Loader2 } from 'lucide-react';

export default function TrainingPage() {
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDrills(); }, []);

  async function fetchDrills() {
    setLoading(true);
    const { data } = await supabase
      .from('match_schedules')
      .select('*')
      .eq('match_type', 'Training')
      .order('match_date', { ascending: true });
    
    if (data) setDrills(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 font-sans">
      <Loader2 className="animate-spin text-red-600" size={32} />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Menyiapkan Jadwal Latihan...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] pb-24">
      
      {/* HEADER SECTION - Judul Pakai Sans-serif */}
      <div className="mb-10 mt-2 font-sans">
        <h1 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
          JADWAL <span className="text-red-600 font-light">LATIHAN</span>
        </h1>
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] leading-none opacity-80 italic">
          // asah skill & kerjasama tim di lapangan
        </p>
      </div>

      {/* DRILLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {drills.map((drill) => (
          <div 
            key={drill.id} 
            className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between hover:border-red-600/30 transition-all group relative overflow-hidden shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[50px]"></div>

            <div className="flex justify-between items-start mb-10 relative z-10">
               <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:bg-red-600/10 transition-all duration-500">
                  <Zap size={24} />
               </div>
               <div className="text-right font-sans">
                  <p className="text-[9px] font-black text-red-600 uppercase italic tracking-widest mb-1">Mulai Jam</p>
                  <p className="text-xl font-bold italic text-white leading-none">
                    {new Date(drill.match_date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB
                  </p>
               </div>
            </div>

            <div className="relative z-10">
              {/* Judul Card Pakai Sans-serif */}
              <h3 className="text-2xl font-black font-sans uppercase mb-6 leading-tight group-hover:text-red-600 transition-colors italic">
                LATIHAN <span className="italic font-light">RUTIN</span>
              </h3>
              
              <div className="space-y-3 border-t border-zinc-900 pt-6 font-sans">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-zinc-900 rounded-lg text-red-600">
                    <Calendar size={14}/>
                  </div>
                  <p className="text-[11px] font-bold uppercase text-zinc-400 italic">
                    {new Date(drill.match_date).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long'})}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-zinc-900 rounded-lg text-red-600">
                    <MapPin size={14}/>
                  </div>
                  <p className="text-[11px] font-bold uppercase text-zinc-400 italic truncate">
                    {drill.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* Tap Indicator for Mobile */}
            <div className="mt-8 flex justify-end md:hidden font-sans">
              <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Detail Sesi</p>
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {drills.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem] opacity-20 mx-2 font-sans">
            <Target size={40} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-[10px] font-bold uppercase tracking-widest italic">Belum ada jadwal latihan minggu ini.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}