'use client';

import { Bell, Ghost, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function UserNotifications() {
  // Simulasi data kosong, nanti bisa ambil dari Supabase
  const notifications = []; 

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            INTEL <span className="text-red-600">INBOX</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 italic">Personnel Notification Center</p>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {/* Mapping data notif di sini nanti */}
        </div>
      ) : (
        /* TAMPILAN KOSONG GAHAR */
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/30">
          <div className="relative mb-6">
            <Ghost size={64} className="text-zinc-800 animate-pulse" />
            <div className="absolute inset-0 blur-3xl bg-red-600/10 rounded-full"></div>
          </div>
          <h3 className="text-white font-black uppercase italic tracking-widest mb-1">No Active Signals</h3>
          <p className="text-zinc-600 font-bold uppercase text-[8px] tracking-[0.3em] text-center max-w-[250px] leading-relaxed">
            Your encrypted inbox is currently empty. Stand by for upcoming mission updates.
          </p>
        </div>
      )}
    </div>
  );
}