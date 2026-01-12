'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Shield, IdCard, MapPin, Save, 
  Loader2, Camera, Trophy, CalendarCheck, Zap,
  Activity, Star, Target, TrendingUp, Award
} from 'lucide-react';

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>({
    id: '', full_name: '', nim: '', role: '', position: '', 
    back_number: '', avatar_url: '', attendance_count: 0, score: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('avatars').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error: any) { alert(error.message); } finally { setUploading(false); }
  }

  async function updateProfile() {
    setUpdating(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name, position: profile.position, back_number: profile.back_number,
    }).eq('id', profile.id);
    if (!error) alert('TACTICAL DATA SYNCHRONIZED');
    setUpdating(false);
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* --- TOP SECTION: IDENTITY HEADER --- */}
      <div className="relative mb-10 p-8 rounded-[3rem] bg-gradient-to-br from-zinc-900 via-black to-black border border-zinc-800 overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* AVATAR HEXAGON STYLE */}
          <div className="relative">
            <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-800 border-2 border-red-600/30 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900"><User size={60} className="text-zinc-700" /></div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-3 bg-red-600 rounded-2xl text-white hover:scale-110 transition-all shadow-lg border-4 border-black"
            >
              <Camera size={16} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="px-3 py-1 bg-red-600 text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)]">Active Personnel</span>
              <span className="text-zinc-500 font-mono text-[10px]">VERIFIED_SQUAD_{profile.nim}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
              {profile.full_name} <span className="text-red-600">#{profile.back_number || '00'}</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Target size={14} className="text-red-600" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">{profile.position || 'UNSET'}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Shield size={14} className="text-red-600" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">{profile.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: STATS VISUALIZER --- */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 italic flex items-center gap-2">
              <TrendingUp size={14} className="text-red-600" /> Combat Performance
            </h3>
            
            <div className="space-y-8">
              {/* Attendance Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-black uppercase text-zinc-400">Attendance Rate</span>
                  <span className="text-xl font-black italic text-white">{profile.attendance_count}<span className="text-zinc-600 text-xs ml-1">sessions</span></span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-1000" 
                    style={{ width: `${Math.min((profile.attendance_count / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Blaze Points */}
              <div className="p-6 bg-red-600 rounded-[2rem] shadow-[0_20px_40px_rgba(220,38,38,0.15)] relative overflow-hidden group">
                <Award className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-125 transition-transform" size={100} />
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Blaze Score</p>
                <p className="text-5xl font-black italic text-white tracking-tighter">{profile.score || 0}</p>
                <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-white/80 uppercase italic">
                  <Zap size={10} /> Rank Status: Gold Tier
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-600">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase italic">Elite Member</p>
              <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter leading-none mt-1">Authorized for major tournaments</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT: DATA MODIFICATION --- */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 md:p-12 h-full">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-10 italic">Modify Tactical Specs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Personnel Name</label>
                <input 
                  type="text" value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-red-600 outline-none transition-all uppercase italic"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Strategic Position</label>
                <select 
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-red-600 outline-none appearance-none uppercase italic transition-all"
                >
                  <option value="GK">Goal Keeper</option>
                  <option value="Anchor">Anchor</option>
                  <option value="Flank">Flank</option>
                  <option value="Pivot">Pivot</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Squad Number</label>
                <input 
                  type="number" value={profile.back_number}
                  onChange={(e) => setProfile({...profile, back_number: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-red-600 outline-none transition-all uppercase italic"
                />
              </div>

              <div className="space-y-3 opacity-40 cursor-not-allowed">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Personnel ID (NIM)</label>
                <div className="w-full bg-zinc-900/50 border border-zinc-900 rounded-2xl py-5 px-6 text-sm font-bold text-zinc-500 italic">
                  {profile.nim}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic leading-none italic">
                  Tactical update stream active
                </p>
              </div>
              <button 
                onClick={updateProfile} disabled={updating}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Push Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}