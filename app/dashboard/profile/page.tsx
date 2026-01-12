'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Shield, IdCard, MapPin, Save, 
  Loader2, Camera, Trophy, CalendarCheck, Zap 
} from 'lucide-react';

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>({
    id: '',
    full_name: '',
    nim: '',
    role: '',
    position: '',
    back_number: '',
    avatar_url: '',
    attendance_count: 0, // Field koneksi absen
    score: 0,            // Field koneksi best player
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    setLoading(false);
  }

  // --- FUNGSI UPLOAD FOTO ---
  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      alert('Photo Operational! Updated successfully.');
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile() {
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        position: profile.position,
        back_number: profile.back_number,
      })
      .eq('id', profile.id);

    if (!error) alert('Profile Tactical Updated!');
    setUpdating(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Accessing Profile Data...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-700 bg-black min-h-screen">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-red-600" />
          <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest text-white/50">Identity Segment</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
          PLAYER <span className="text-red-600">PROFILE</span>
        </h1>
      </div>

      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: AVATAR & QUICK STATS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative group bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-red-600 transition-all duration-500 relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-zinc-700" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={24} />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-red-600 rounded-2xl text-white shadow-lg hover:scale-110 active:scale-95 transition-all">
                <Camera size={16} />
              </button>
            </div>

            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-1">{profile.full_name}</h2>
            <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">{profile.role || 'Player'}</p>
            
            {/* MINI STATS CARDS */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-900">
              <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                <CalendarCheck className="mx-auto mb-2 text-blue-500" size={18} />
                <p className="text-[18px] font-black italic text-white leading-none">{profile.attendance_count || 0}</p>
                <p className="text-[8px] font-bold text-zinc-600 uppercase mt-1">Sesi Hadir</p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                <Trophy className="mx-auto mb-2 text-amber-500" size={18} />
                <p className="text-[18px] font-black italic text-white leading-none">{profile.score || 0}</p>
                <p className="text-[8px] font-bold text-zinc-600 uppercase mt-1">Total Poin</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM DATA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
            <h3 className="text-xs font-black uppercase italic text-zinc-500 mb-8 flex items-center gap-2">
              <Zap size={14} className="text-red-600" /> Bio-Metric Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                  <input 
                    type="text" value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Student ID (NIM)</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                  <input type="text" value={profile.nim} disabled className="w-full bg-zinc-900/30 border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-500 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Tactical Position</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                  <select 
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none appearance-none uppercase"
                  >
                    <option value="">Select Position</option>
                    <option value="GK">Goal Keeper (GK)</option>
                    <option value="Anchor">Anchor</option>
                    <option value="Flank">Flank</option>
                    <option value="Pivot">Pivot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Squad Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-sm">#</div>
                  <input 
                    type="number" value={profile.back_number}
                    onChange={(e) => setProfile({...profile, back_number: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none uppercase"
                    placeholder="00"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-zinc-900">
              <button 
                onClick={updateProfile} disabled={updating}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-red-900/20 active:scale-95"
              >
                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Update Identity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}