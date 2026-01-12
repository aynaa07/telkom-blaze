'use client';

import { Bell, ShieldAlert, Ghost, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  // Simulasi data kosong (Nanti ganti dengan data dari Supabase)
  const notifications = []; 

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          INTEL <span className="text-red-600">INBOX</span>
        </h1>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {/* Mapping notifikasi mas di sini */}
        </div>
      ) : (
        /* --- TAMPILAN KALO GAK ADA NOTIF --- */
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/30">
          <div className="relative mb-6">
            <Ghost size={64} className="text-zinc-800 animate-bounce" />
            <div className="absolute inset-0 blur-2xl bg-red-600/10 rounded-full"></div>
          </div>
          <p className="text-zinc-500 font-black uppercase italic tracking-[0.3em] text-[10px] mb-2">No Active Signals</p>
          <p className="text-zinc-700 font-bold uppercase text-[8px] tracking-widest text-center max-w-[200px]">
            Your inbox is clear. Stay alert for upcoming mission updates.
          </p>
        </div>
      )}
    </div>
  );
}