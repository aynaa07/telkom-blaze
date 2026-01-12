'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, User, Mail, Save, Loader2, 
  Camera, Activity, Terminal, Database,
  Cpu, Zap, Globe, Lock, 
  Users, IdCard // <--- Pastikan dua ini ADA di dalam kurung kurawal
} from 'lucide-react';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adminStats, setAdminStats] = useState({ newsCount: 0, playersManaged: 0 });
  const [profile, setProfile] = useState<any>({
    id: '', full_name: '', nim: '', role: '', avatar_url: '', email: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, newsRes, playersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('news').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      if (profileRes.data) {
        setProfile({ ...profileRes.data, email: user.email });
      }
      setAdminStats({
        newsCount: newsRes.count || 0,
        playersManaged: playersRes.count || 0
      });
    } catch (error) { 
      console.error('Fetch Error:', error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchAdminData(); 
  }, [fetchAdminData]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `admin-${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      alert('AVATAR REPLACED // SYSTEM UPDATED');
    } catch (error: any) { 
      alert('Upload failed: ' + error.message); 
    } finally { 
      setUploading(false); 
    }
  }

  async function handleUpdate() {
    if (!profile.full_name.trim()) return alert('Name cannot be empty');
    setUpdating(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
    }).eq('id', profile.id);
    
    if (!error) alert('ADMINISTRATIVE RECORDS UPDATED');
    setUpdating(false);
  }

  if (loading) return (
    <div className="min-h-[80vh] bg-black flex flex-col items-center justify-center p-6">
      <div className="relative mb-6">
        <Cpu className="animate-spin text-red-600" size={48} />
        <div className="absolute inset-0 blur-2xl bg-red-600/20 animate-pulse"></div>
      </div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] italic">Establishing Secure Root Connection...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto">
      
      {/* --- HEADER COMMAND CENTER --- */}
      <div className="relative mb-12 p-8 md:p-12 rounded-[3rem] bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/5 to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* AVATAR BOX */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-[2.5rem] border border-red-600 animate-pulse opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-black border-2 border-zinc-800 group-hover:border-red-600/50 overflow-hidden relative transition-all duration-700 shadow-2xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Admin" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900"><ShieldCheck size={64} className="text-zinc-800" /></div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-4 bg-red-600 rounded-2xl text-white hover:scale-110 transition-all border-4 border-black shadow-xl z-30"
            >
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-lg">
                <Terminal size={12} className="text-red-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Access: Root</span>
              </div>
              <span className="text-zinc-700 font-mono text-[10px] uppercase tracking-tighter italic">Encrypted_Session_Active</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none truncate">
              {profile.full_name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4">
               <div className="h-1 w-20 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
               <p className="text-zinc-500 font-bold uppercase italic text-[11px] tracking-widest flex items-center gap-2">
                 <Lock size={12} className="text-red-600" /> Command Authority
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT SIDE: METRICS --- */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10 italic flex items-center gap-2">
              <Database size={14} className="text-red-600" /> Core Metrics
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl group hover:border-red-600/20 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Globe size={20} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase">Intel Blasted</span>
                </div>
                <p className="text-4xl font-black italic text-white tracking-tighter">{adminStats.newsCount}</p>
              </div>

              <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl group hover:border-red-600/20 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Users size={20} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase">Total Assets</span>
                </div>
                <p className="text-4xl font-black italic text-white tracking-tighter">{adminStats.playersManaged}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl flex items-center gap-4 border-l-4 border-l-red-600">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-red-600 shadow-inner">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase italic">Master Control</p>
              <p className="text-[9px] text-zinc-600 uppercase font-bold leading-none mt-1 italic tracking-tighter">Authorized for global override</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: TERMINAL CONFIG --- */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
              <div className="w-8 h-px bg-zinc-800"></div> System Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} className="text-red-600" /> Administrative Name
                </label>
                <input 
                  type="text" value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all uppercase italic shadow-inner"
                />
              </div>

              <div className="space-y-3 opacity-60">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mail size={12} /> Secure Email
                </label>
                <div className="w-full bg-zinc-900/20 border border-zinc-900 rounded-2xl py-5 px-6 text-sm font-bold text-zinc-600 italic truncate">
                  {profile.email}
                </div>
              </div>

              <div className="space-y-3 opacity-60">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <IdCard size={12} /> Personnel ID (NIM)
                </label>
                <div className="w-full bg-zinc-900/20 border border-zinc-900 rounded-2xl py-5 px-6 text-sm font-bold text-zinc-600 italic">
                  {profile.nim}
                </div>
              </div>

              <div className="space-y-3 opacity-60">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck size={12} /> Access Role
                </label>
                <div className="w-full bg-zinc-900/20 border border-zinc-900 rounded-2xl py-5 px-6 text-sm font-bold text-zinc-600 italic uppercase">
                  {profile.role}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">
                  System link stable // AES-256 active
                </p>
              </div>
              <button 
                onClick={handleUpdate} disabled={updating}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-95"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Override Sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}