'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Megaphone, Plus, X, Trash2, Send, Loader2, Calendar, BellRing
} from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '' });

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (data) setNotifications(data);
    } finally { setLoading(false); }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.message) return alert("Isi semua data!");
    setSending(true);
    const { error } = await supabase.from('notifications').insert([{ 
      title: formData.title.toUpperCase(), 
      message: formData.message, 
      type: 'broadcast', 
      is_broadcast: true 
    }]);
    if (!error) {
      setFormData({ title: '', message: '' });
      setIsModalOpen(false);
      fetchNotifications();
    }
    setSending(false);
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 font-['Belleza'] tracking-wide">
      <style jsx global>{` @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@300;400;500;600&display=swap'); `}</style>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 font-['Poppins']">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight text-white leading-none">
            Broadcast <span className="text-red-600 font-light italic">Center</span>
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] mt-3 font-medium opacity-80">// Kirim Pengumuman ke Seluruh Squad</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[11px] font-medium uppercase tracking-widest transition-all shadow-xl shadow-red-900/10 active:scale-95">
          <Plus size={18} /> Buat Notifikasi
        </button>
      </div>

      {/* LIST HISTORI */}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] hover:border-red-600/30 transition-all flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-red-600 shrink-0 border border-zinc-800 transition-colors">
              <Megaphone size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm md:text-base font-medium uppercase tracking-wide text-zinc-100 font-['Poppins']">{n.title}</h3>
                <button onClick={() => { if(confirm('Hapus?')) supabase.from('notifications').delete().eq('id', n.id).then(fetchNotifications); }} className="text-zinc-800 hover:text-red-600 p-2 transition-colors"><Trash2 size={16}/></button>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">{n.message}</p>
              <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-['Poppins']">
                <Calendar size={12}/> {new Date(n.created_at).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-12 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-medium uppercase text-white tracking-tight mb-8 font-['Poppins']">Broadcasting <span className="text-red-600">Intel</span></h2>
            <form onSubmit={handleBroadcast} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 font-['Poppins']">Headline</label>
                <input placeholder="Judul Pengumuman..." className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-6 text-sm font-medium text-white focus:border-red-600 outline-none transition-all uppercase" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 font-['Poppins']">Payload Message</label>
                <textarea placeholder="Tulis pengumuman di sini..." rows={4} className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-6 text-sm font-medium text-zinc-300 focus:border-red-600 outline-none transition-all resize-none" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
              </div>
              <button disabled={sending} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl text-[11px] font-medium uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-red-900/20 active:scale-95">
                {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />} Transmit To Squad
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}