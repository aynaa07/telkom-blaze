'use client';

import { Bell, Ghost, Plus, Send } from 'lucide-react';

export default function AdminNotifications() {
  const notifications = []; 

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            COMMAND <span className="text-red-600">INBOX</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 italic">Broadcast Management System</p>
        </div>
        
        {/* Tombol buat broadcast notif baru */}
        <button className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95">
          <Send size={16} /> Broadcast New Intel
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {/* List notif admin */}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/30 text-center">
          <Ghost size={64} className="text-zinc-800 mb-6" />
          <h3 className="text-white font-black uppercase italic tracking-widest mb-1">No Broadcast History</h3>
          <p className="text-zinc-600 font-bold uppercase text-[8px] tracking-[0.3em] max-w-[250px]">
            You haven't sent any tactical notifications to the squad yet.
          </p>
        </div>
      )}
    </div>
  );
}