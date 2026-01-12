'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Database, 
  Save, 
  Loader2, 
  Camera,
  Activity,
  Terminal
} from 'lucide-react';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adminStats, setAdminStats] = useState({ newsCount: 0, playersManaged: 0 });
  const [profile, setProfile] = useState<any>({
    id: '',
    full_name: '',
    nim: '',
    role: '',
    email: '',
    avatar_url: '' // Tambahkan field avatar_url
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
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
    }
    setLoading(false);
  }

  // FUNGSI UPLOAD FOTO
  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload ke Storage (Pastikan bucket 'avatars' sudah ada dan public)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update State & Database
      setProfile({ ...profile, avatar_url: publicUrl });
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      alert('Avatar Tactical Updated!');
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate() {
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name })
      .eq('id', profile.id);

    if (!error) alert('Administrative Record Updated!');
    setUpdating(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Connection...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-700 bg-black min-h-screen">
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-red-600">
          <Terminal size={14} />
          <span className="text-[10px] uppercase font-black tracking-[0.5em] italic">Root Access Level</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
          ADMIN <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">PROFILE</span>
        </h1>
      </div>

      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={120} className="text-red-600" />
            </div>

            {/* FOTO PROFILE SECTION */}
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-red-600 transition-all duration-500 relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Admin Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <User size={48} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                )}
                
                {/* Loading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={24} />
                  </div>
                )}
              </div>
              
              {/* Camera Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-3 bg-red-600 rounded-2xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
              >
                <Camera size={16} />
              </button>
              
              {/* Hidden Input File */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={uploadAvatar}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="text-center relative z-10">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white line-clamp-1">{profile.full_name}</h2>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                <ShieldCheck size={10} className="text-red-600" />
                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none">System Administrator</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-zinc-900">
              <div className="text-center">
                <p className="text-2xl font-black italic text-white leading-none">{adminStats.newsCount}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2 italic">News Blasted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black italic text-white leading-none">{adminStats.playersManaged}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2 italic">Database Size</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl">
             <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <Activity size={14} className="text-red-600" />
                <span className="text-[9px] font-black uppercase tracking-widest">System Status</span>
             </div>
             <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed italic">
                Akses ini memberikan kendali penuh atas publikasi berita dan manajemen database pemain.
             </p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 md:p-10">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-10 italic">Account Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Admin Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input 
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-black border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-red-600 transition-all uppercase italic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input 
                  type="text"
                  value={profile.email}
                  disabled
                  className="w-full bg-zinc-900/20 border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-700 cursor-not-allowed italic"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-zinc-900">
            <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic hidden md:block">
              // Security Protocol Active
            </p>
            <button 
              onClick={handleUpdate}
              disabled={updating}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3"
            >
              {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Push Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}