'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, Ghost, Loader2, Clock, 
  Megaphone, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil Data Awal
    fetchNotifications();

    // 2. AKTIFKAN RADAR REAL-TIME (Dengerin database secara live)
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Hanya dengerin data baru masuk
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('NEW_SIGNAL_RECEIVED:', payload.new);
          // Tambahkan notif baru ke posisi paling atas secara instan
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // 3. Cleanup saat pindah halaman
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('System Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse"></div>
      </div>
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Scanning Frequencies...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-red-600">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-[0.4em] italic leading-none">Encrypted Receiver Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
            INTEL <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">INBOX</span>
          </h1>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-sm">
          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic leading-none mb-1 text-center md:text-left">Signal Status</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase italic">Live Synchronized</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATION FEED */}
      {notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className="group relative bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2.5rem] hover:border-red-600/40 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                <Bell size={100} className="text-red-600" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                {/* ICON BOX */}
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-red-600 group-hover:border-red-600/20 transition-all duration-500 shadow-inner shrink-0">
                  <Megaphone size={24} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h3 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-red-600 transition-colors">
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tighter italic">
                        {new Date(n.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-px w-12 bg-zinc-800 group-hover:w-24 group-hover:bg-red-600 transition-all duration-500"></div>
                  
                  <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed uppercase italic tracking-wide group-hover:text-zinc-300 transition-colors">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-900 rounded-[3.5rem] bg-zinc-950/20 text-center animate-pulse">
          <div className="relative mb-8">
            <Ghost size={80} className="text-zinc-800" />
            <div className="absolute inset-0 blur-3xl bg-red-600/5 rounded-full"></div>
          </div>
          <h3 className="text-white font-black uppercase italic tracking-[0.2em] mb-2 text-xl">Zero Signal</h3>
          <p className="text-zinc-600 font-bold uppercase text-[9px] tracking-[0.4em] max-w-[300px] leading-relaxed italic px-4">
            No tactical broadcasts detected in your sector. Stay alert for future transmissions.
          </p>
        </div>
      )}
    </div>
  );
}