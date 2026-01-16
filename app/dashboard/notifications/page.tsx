'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BellRing, Megaphone, Calendar, Loader2 } from 'lucide-react';

export default function PlayerNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifs() {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (data) setNotifications(data);
      setLoading(false);
    }
    fetchNotifs();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-red-600 mb-4" />
      <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest font-['Poppins']">Menerima Sinyal...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-700 font-['Belleza'] tracking-wide">
      <style jsx global>{` @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@300;400;500;600&display=swap'); `}</style>
      
      {/* HEADER */}
      <div className="mb-12 font-['Poppins']">
        <div className="flex items-center gap-2 mb-3 text-red-500/80">
           <BellRing size={16} className="animate-bounce" />
           <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Inbox Notifikasi</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-white">
          TIM <span className="text-red-600 font-light italic">UPDATES</span>
        </h1>
      </div>

      {/* NOTIF CARDS */}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="group relative bg-zinc-950 border border-zinc-900/80 p-6 rounded-[2rem] hover:border-red-600/30 transition-all duration-500 overflow-hidden shadow-lg">
            <div className="relative z-10 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-red-600 transition-colors shrink-0 border border-zinc-800 shadow-inner">
                <Megaphone size={20} />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm md:text-base font-medium uppercase tracking-wide text-zinc-100 font-['Poppins'] group-hover:text-red-500 transition-colors">
                    {n.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-['Poppins'] font-medium">
                    <Calendar size={12} />
                    <span>{new Date(n.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
            {/* Dekorasi Background */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-white group-hover:opacity-[0.05] transition-opacity">
              <Megaphone size={120} />
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="py-32 text-center opacity-20 uppercase tracking-[0.4em] text-[10px] font-bold font-['Poppins'] border-2 border-dashed border-zinc-900 rounded-[3rem]">
          Belum ada pengumuman
        </div>
      )}
    </div>
  );
}