'use client';

import { Bell, Info, ShieldAlert, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  // Contoh data (Nanti ini bisa ditarik dari Supabase)
  const notifications = [
    { id: 1, type: 'match', title: 'NEW MATCH INTEL', message: 'Pertandingan melawan Tim Alpha dijadwalkan besok jam 16:00.', time: '2h ago' },
    { id: 2, type: 'finance', title: 'TREASURY UPDATE', message: 'Uang kas bulanan telah diperbarui. Silakan cek saldo mas.', time: '5h ago' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
        INTEL <span className="text-red-600">INBOX</span>
      </h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-start gap-5 group hover:border-red-600/50 transition-all">
            <div className="bg-red-600/10 p-3 rounded-xl border border-red-600/20 text-red-600">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black italic uppercase text-sm tracking-wide text-white">{n.title}</h3>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{n.time}</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed uppercase">{n.message}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-600 transition-all">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}