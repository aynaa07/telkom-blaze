'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Save, Loader2, Camera, 
  Shield, Settings, History, Phone,
  Trophy, CheckCircle2, Star, MessageCircle,
  Activity, Award, Zap
} from 'lucide-react';

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile');
  
  const [profile, setProfile] = useState<any>({
    id: '', full_name: '', nim: '', role: '', avatar_url: '', email: '',
    phone: '', position: '', back_number: '', score: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({ 
          ...data, 
          email: user.email,
          phone: data.phone || '', 
          position: data.position || '',
          back_number: data.back_number || ''
        });
      }
    } catch (error) { 
      console.error('Fetch Error:', error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `user-pfp-${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      if (updateError) throw updateError;
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      alert('Foto profil berhasil diperbarui!');
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
      position: profile.position,
      back_number: profile.back_number
    }).eq('id', profile.id);
    
    if (!error) {
        alert('Data berhasil disinkronkan ke database!');
    } else {
        alert('Gagal update: ' + error.message);
    }
    setUpdating(false);
  }

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-red-600 mb-2" size={32} />
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">Menghubungkan Data Pemain...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 font-['Belleza',sans-serif]">
      
      {/* HEADER: PROFILE OVERVIEW */}
      <div className="relative mb-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-2 border-zinc-800 bg-black shadow-2xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900"><User size={48} className="text-zinc-800" /></div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-red-600" size={24} />
                </div>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-red-600 rounded-2xl text-white shadow-xl hover:bg-red-700 active:scale-90 transition-all border-4 border-black">
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <div className="text-center md:text-left flex-1 font-['Poppins',sans-serif]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans">Player Member</span>
              <CheckCircle2 size={14} className="text-red-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{profile.full_name} <span className="text-red-600">#{profile.back_number || '00'}</span></h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 text-sm">
              <p className="flex items-center gap-2 italic uppercase font-sans font-bold text-[10px] tracking-widest"><Star size={14} className="text-red-600" /> {profile.position || 'RESERVE'}</p>
              <p className="flex items-center gap-2 italic uppercase font-sans font-bold text-[10px] tracking-widest"><Zap size={14} className="text-red-600" /> {profile.score || 0} POINTS</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION - Button Style */}
      <div className="flex gap-3 bg-zinc-950 p-2 rounded-[1.5rem] border border-zinc-900 mb-8 w-fit shadow-xl">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic font-sans ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
          >
            Edit Profil
          </button>
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic font-sans ${activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
          >
            Histori Poin
          </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-8 italic">
                <Settings size={14} className="text-red-600" /> Pengaturan Data Taktis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-['Poppins',sans-serif]">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1 font-sans italic tracking-widest">Nama Lengkap</label>
                  <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl p-5 text-sm font-black italic text-white focus:border-red-600 outline-none transition-all uppercase shadow-inner" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1 font-sans italic tracking-widest">Posisi Utama</label>
                  <select value={profile.position} onChange={(e) => setProfile({...profile, position: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl p-5 text-sm font-black italic text-white focus:border-red-600 outline-none transition-all uppercase appearance-none shadow-inner">
                    <option value="GK">Goal Keeper</option>
                    <option value="Anchor">Anchor</option>
                    <option value="Flank">Flank</option>
                    <option value="Pivot">Pivot</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1 font-sans italic tracking-widest">Nomor Punggung</label>
                  <input type="number" value={profile.back_number} onChange={(e) => setProfile({...profile, back_number: e.target.value})} className="w-full bg-black border border-zinc-900 rounded-2xl p-5 text-sm font-black italic text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1 font-sans italic tracking-widest">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-800" size={16} />
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="628..." className="w-full bg-black border border-zinc-900 rounded-2xl p-5 pl-12 text-sm font-black italic text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-900 flex justify-end">
                {/* BUTTON UTAMA: UPDATE DATA */}
                <button 
                  onClick={handleSave} 
                  disabled={updating} 
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl shadow-red-900/40 italic font-sans"
                >
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Profil
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl h-fit">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-6 font-sans italic"><Award size={14} className="text-red-600" /> Info Squad</h3>
              <p className="text-[11px] text-zinc-600 uppercase font-bold leading-relaxed mb-8 italic tracking-tight font-sans">Data keanggotaan resmi yang tercatat di sistem pusat.</p>
              
              <div className="space-y-4">
                <div className="p-5 bg-black border border-zinc-900 rounded-2xl flex items-center justify-between shadow-inner">
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-sans italic">Poin Blaze</span>
                   <span className="text-2xl font-black italic text-red-600 font-['Poppins',sans-serif]">{profile.score}</span>
                </div>
                <div className="p-5 bg-black border border-zinc-900 rounded-2xl flex items-center justify-between shadow-inner">
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-sans italic">Hadir Latihan</span>
                   <span className="text-2xl font-black italic text-white font-['Poppins',sans-serif]">{profile.attendance_count || 0}x</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* LOG POIN */
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500 font-sans">
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 bg-zinc-900/10 border-b border-zinc-900">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Riwayat Sesi Terakhir</h3>
              </div>
              <div className="divide-y divide-zinc-900 font-sans">
                  <LogItem action="Sesi Latihan" desc="Hadir tepat waktu di GOR" time="+5 Poin" />
                  <LogItem action="Match Intel" desc="Masuk daftar pemain tanding" time="+10 Poin" />
                  <LogItem action="Update Profil" desc="Sinkronisasi data taktikal" time="Berhasil" />
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

function LogItem({ action, desc, time }: any) {
    return (
        <div className="p-6 flex justify-between items-start group hover:bg-zinc-900/20 transition-all cursor-default">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-red-600 group-hover:bg-red-600/10 transition-all border border-zinc-800 group-hover:border-red-600/30">
                    <History size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-black text-white uppercase italic tracking-wider">{action}</p>
                    <p className="text-[10px] text-zinc-600 mt-1 font-bold italic">{desc}</p>
                </div>
            </div>
            <span className="text-[9px] font-black text-red-600 uppercase italic bg-red-600/5 px-3 py-1.5 rounded-lg border border-red-600/20">{time}</span>
        </div>
    )
}