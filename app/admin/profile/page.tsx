'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Mail, Save, Loader2, Camera, 
  Shield, Settings, Users, History, Phone,
  Briefcase, CheckCircle2, ExternalLink, MessageCircle
} from 'lucide-react';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile');
  const [logs, setLogs] = useState<any[]>([]);
  
  const [profile, setProfile] = useState<any>({
    id: '', full_name: '', nim: '', role: '', avatar_url: '', email: '',
    phone: '', position: '' 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, logRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8)
      ]);

      if (profRes.data) {
        setProfile({ 
          ...profRes.data, 
          email: user.email,
          phone: profRes.data.phone || '', 
          position: profRes.data.position || '' 
        });
      }
      if (logRes.data) setLogs(logRes.data);

    } catch (error) { 
      console.error('Fetch Error:', error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `admin-pfp-${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      await supabase.from('activity_logs').insert({
        user_id: profile.id,
        action: 'UPDATE_FOTO_ADMIN',
        description: 'Berhasil mengganti foto profil sistem.'
      });

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      fetchAdminData();
      alert('Foto profil diperbarui!');
    } catch (error: any) { 
      alert('Gagal: ' + error.message); 
    } finally { 
      setUploading(false); 
    }
  }

  async function handleSave() {
    setUpdating(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      position: profile.position
    }).eq('id', profile.id);
    
    if (!error) {
        await supabase.from('activity_logs').insert({
          user_id: profile.id,
          action: 'UPDATE_DATA_ADMIN',
          description: `Update informasi jabatan: ${profile.position}`
        });
        alert('DATA ADMIN DISINKRONKAN!');
        fetchAdminData();
    }
    setUpdating(false);
  }

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] italic animate-pulse">Syncing Admin Data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-10 px-3 md:px-4 font-['Belleza',sans-serif] selection:bg-red-600 pb-24">
      
      {/* HEADER: MOBILE COMPACT STYLE */}
      <div className="relative mb-6 bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] -z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="relative">
            <div className="w-28 h-28 md:w-44 md:h-44 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-2 border-red-600/20 bg-black shadow-2xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover grayscale-[20%]" alt="Admin" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900"><User size={40} className="text-zinc-800" /></div>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-3 bg-red-600 rounded-xl text-white shadow-xl active:scale-90 border-4 border-black">
              <Camera size={14} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <div className="text-center md:text-left flex-1 font-['Poppins',sans-serif]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg">ADMIN CONTROL</span>
              <CheckCircle2 size={14} className="text-red-600" />
            </div>
            <h1 className="text-2xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none mb-3">{profile.full_name}</h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 italic bg-white/5 px-4 py-2 rounded-lg border border-white/5 inline-block">{profile.position || 'PENGURUS INTI'}</p>
          </div>
        </div>
      </div>

      {/* TABS: BIG BUTTON STYLE FOR MOBILE */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 mb-8 shadow-xl">
          <button onClick={() => setActiveTab('profile')} className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic font-['Poppins',sans-serif] ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600'}`}>Data Inti</button>
          <button onClick={() => setActiveTab('logs')} className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic font-['Poppins',sans-serif] ${activeTab === 'logs' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600'}`}>Log</button>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl">
              <h3 className="text-sm md:text-xl font-normal text-zinc-100 uppercase mb-8 italic flex items-center gap-3">
                <Settings size={18} className="text-red-600" /> Edit Konfigurasi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase italic tracking-widest ml-1">Nama Lengkap</label>
                  <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-black italic text-white focus:border-red-600 outline-none transition-all uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase italic tracking-widest ml-1">Jabatan</label>
                  <input type="text" value={profile.position} onChange={(e) => setProfile({...profile, position: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-black italic text-white focus:border-red-600 outline-none transition-all uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase italic tracking-widest ml-1">Nomor WhatsApp</label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="628..." className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs font-black italic text-white focus:border-red-600 outline-none transition-all" />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-900">
                <button onClick={handleSave} disabled={updating} className="w-full bg-red-600 hover:bg-red-700 text-white py-4.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl italic font-['Poppins',sans-serif]">
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SIMPAN PERUBAHAN
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-6 italic font-sans flex items-center gap-2"><Shield size={14} className="text-red-600" /> Admin Tools</h3>
              <button onClick={() => window.location.href='/admin/players'} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl active:scale-95 transition-all">
                <span className="text-[10px] font-black uppercase italic text-white font-sans tracking-widest">Manage Squad</span>
                <ExternalLink size={14} className="text-zinc-600" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* LOG: MOBILE LIST STYLE */
        <div className="animate-in fade-in duration-500">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-5 bg-zinc-900/20 border-b border-zinc-900">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 italic font-sans tracking-widest">ACTIVITY LOG</h3>
            </div>
            <div className="divide-y divide-zinc-900">
              {logs.map((log) => (
                <div key={log.id} className="p-5 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-red-600 shrink-0 border border-zinc-800"><History size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-white uppercase italic truncate font-['Poppins',sans-serif]">{log.action.replace('_', ' ')}</p>
                    <p className="text-[9px] text-zinc-600 italic font-sans leading-none mt-1">{new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@800;900&display=swap');
      `}</style>
    </div>
  );
}