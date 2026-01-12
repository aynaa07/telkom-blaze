'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, Ghost, Send, Terminal, Loader2, 
  Plus, X, Clock, Trash2, Megaphone 
} from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchNotifications();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.message) return alert("Fill all coordinates!");

    try {
      setSending(true);
      const { error } = await supabase.from('notifications').insert([
        { 
          title: formData.title.toUpperCase(), 
          message: formData.message,
          type: 'broadcast',
          is_broadcast: true 
        }
      ]);

      if (error) throw error;

      alert('INTEL TRANSMITTED SUCCESSFULLY!');
      setFormData({ title: '', message: '' });
      setIsModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      alert('Transmission Failed: ' + err.message);
    } finally {
      setSending(false);
    }
  }

  async function deleteNotif(id: string) {
    if (!confirm('Abort this intel record?')) return;
    await supabase.from('notifications').delete().eq('id', id);
    fetchNotifications();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <Terminal size={14} className="animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-[0.4em] italic">Command Broadcast System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
            COMMAND <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">INBOX</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
          Broadcast New Intel
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Scanning Outgoing Signals...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((n) => (
            <div key={n.id} className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] hover:border-red-600/30 transition-all flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-red-600 transition-colors shrink-0">
                <Megaphone size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black italic uppercase text-sm tracking-wide text-white truncate">{n.title}</h3>
                  <span className="px-2 py-0.5 bg-zinc-900 text-[8px] font-black text-zinc-500 rounded uppercase tracking-tighter italic">Sent</span>
                </div>
                <p className="text-[11px] text-zinc-500 uppercase font-medium line-clamp-2 italic">{n.message}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Clock size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => deleteNotif(n.id)}
                  className="p-3 bg-zinc-900/50 hover:bg-red-600/10 text-zinc-700 hover:text-red-600 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/30 text-center">
          <Ghost size={64} className="text-zinc-800 mb-6 animate-pulse" />
          <h3 className="text-white font-black uppercase italic tracking-widest mb-1">Zero History Detected</h3>
          <p className="text-zinc-600 font-bold uppercase text-[8px] tracking-[0.3em] max-w-[250px]">
            No tactical broadcasts have been transmitted from this terminal yet.
          </p>
        </div>
      )}

      {/* --- BROADCAST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-12 relative shadow-[0_0_50px_rgba(220,38,38,0.1)]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-10">
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">
                NEW <span className="text-red-600">BROADCAST</span>
              </h2>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Personnel Alert Protocol</p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Intel Heading</label>
                <input 
                  autoFocus
                  placeholder="EX: SCHEDULE UPDATE"
                  className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-red-600 outline-none transition-all uppercase italic"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Message Payload</label>
                <textarea 
                  placeholder="TYPE TACTICAL MESSAGE HERE..."
                  rows={4}
                  className="w-full bg-black border border-zinc-900 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-red-600 outline-none transition-all uppercase italic resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={sending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-4 italic shadow-lg shadow-red-900/20"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Transmit Intel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}