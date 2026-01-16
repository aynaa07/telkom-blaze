'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Loader2, User, Trophy, 
  Target, Heart, CalendarCheck, X, Save, 
  ShieldCheck, ShieldAlert, Star, Trash2, Briefcase, ChevronDown, Edit3,
  CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // MODAL & UI STATES
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // TOAST NOTIFICATION STATE
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({
    show: false, msg: '', type: 'success'
  });

  useEffect(() => { fetchPlayers(); }, []);

  // FUNGSI UNTUK MEMUNCULKAN TOAST
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  async function fetchPlayers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
    if (data) setPlayers(data);
    setLoading(false);
  }

  const handleSaveScore = async () => {
    setUpdating(true);
    const finalScore = (Number(selectedPlayer.goals || 0) * 10) + Number(selectedPlayer.attitude_score || 0) + (Number(selectedPlayer.attendance_count || 0) * 5);
    const { error } = await supabase.from('profiles').update({ 
      goals: selectedPlayer.goals, attitude_score: selectedPlayer.attitude_score, 
      attendance_count: selectedPlayer.attendance_count, score: finalScore 
    }).eq('id', selectedPlayer.id);

    if (!error) { 
      fetchPlayers(); 
      setIsScoreModalOpen(false); 
      showToast('Statistik performa berhasil disinkronkan!');
    }
    setUpdating(false);
  };

  const handleSaveRole = async () => {
    setUpdating(true);
    const { error } = await supabase.from('profiles').update({ 
      role: selectedPlayer.role, position: selectedPlayer.position 
    }).eq('id', selectedPlayer.id);

    if (!error) {
      fetchPlayers();
      setIsRoleModalOpen(false);
      showToast('Akses & Jabatan berhasil diperbarui!');
    } else {
      showToast('Gagal memperbarui data!', 'error');
    }
    setUpdating(false);
  };

  const filtered = players.filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.nim?.includes(searchTerm));

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 animate-pulse font-sans">Accessing Databases...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* --- CUSTOM TOAST POPUP --- */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top duration-500">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            toast.type === 'success' ? 'bg-zinc-950/80 border-green-500/50 text-green-400' : 'bg-zinc-950/80 border-red-500/50 text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-[11px] font-bold uppercase tracking-widest font-sans">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 font-['Poppins',sans-serif]">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight text-white leading-none">
            Manajemen <span className="text-red-600">Pemain</span>
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-3 font-sans font-bold">// Squad Personnel Management</p>
        </div>
        <div className="relative w-full md:w-80 font-sans group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={16} />
          <input onChange={(e) => setSearchTerm(e.target.value)} placeholder="CARI NAMA / NIM..." className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold text-zinc-100 focus:border-red-600 outline-none transition-all uppercase" />
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-900/30 text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] border-b border-zinc-900">
              <tr>
                <th className="p-8">Pemain</th>
                <th className="p-8 text-center">Skor</th>
                <th className="p-8 text-center">Hak Akses</th>
                <th className="p-8 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50 font-sans">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/10 transition-all">
                  <td className="p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg group-hover:border-red-600/30 transition-all">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-950"><User size={20} className="text-zinc-800" /></div>}
                    </div>
                    <div>
                      <p className="font-bold text-base text-zinc-100 font-['Poppins',sans-serif] uppercase tracking-tight">{p.full_name}</p>
                      <p className="text-[10px] text-zinc-600 font-bold tracking-wider mt-1 uppercase font-sans">{p.nim} • <span className="text-red-600 italic">{p.position || 'ANGGOTA'}</span></p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/10 text-amber-500">
                      <Star size={14} fill="currentColor" /> <span className="text-xl font-bold">{p.score || 0}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => { setSelectedPlayer({...p, position: ""}); setIsRoleModalOpen(true); }} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 border ${p.role === 'admin' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                      {p.role === 'admin' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>} {p.role === 'admin' ? 'ADMIN' : 'PLAYER'}
                    </button>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedPlayer(p); setIsScoreModalOpen(true); }} className="bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black text-zinc-300 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"><Edit3 size={14}/> Nilai</button>
                      <button onClick={() => { if(confirm('Hapus pemain?')) supabase.from('profiles').delete().eq('id', p.id).then(fetchPlayers); }} className="p-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-600 hover:text-red-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL ROLE & JABATAN --- */}
      {isRoleModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-semibold uppercase text-white tracking-tight leading-none mb-1 font-['Poppins',sans-serif]">Akses Akun</h2>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-sans italic">Modify Personnel Identity</p>
              </div>
              <button onClick={() => {setIsRoleModalOpen(false); setIsDropdownOpen(false);}} className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-8 font-sans">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2 italic"><Briefcase size={12} className="text-red-600"/> Jabatan Baru</label>
                <input type="text" value={selectedPlayer.position} onChange={(e) => setSelectedPlayer({...selectedPlayer, position: e.target.value.toUpperCase()})} placeholder="Ketik Jabatan (E.g. KETUA)..." className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-800 uppercase italic" />
              </div>
              <div className="space-y-3 relative">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2 italic"><ShieldCheck size={12} className="text-red-600"/> Level Otoritas</label>
                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full bg-black border ${isDropdownOpen ? 'border-red-600' : 'border-zinc-800'} rounded-2xl p-5 flex items-center justify-between group transition-all`}>
                    <div className="flex items-center gap-3">
                      {selectedPlayer.role === 'admin' ? <ShieldCheck size={18} className="text-red-600" /> : <ShieldAlert size={18} className="text-zinc-600" />}
                      <span className={`text-xs font-bold uppercase tracking-widest ${selectedPlayer.role === 'admin' ? 'text-white' : 'text-zinc-400'}`}>{selectedPlayer.role === 'admin' ? 'ADMINISTRATOR' : 'PLAYER MEMBER'}</span>
                    </div>
                    <ChevronDown size={18} className={`text-zinc-800 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in zoom-in-95 duration-200">
                      <button onClick={() => { setSelectedPlayer({...selectedPlayer, role: 'user'}); setIsDropdownOpen(false); }} className="w-full p-5 flex items-center gap-4 hover:bg-zinc-900 transition-colors text-left group border-b border-zinc-900">
                        <ShieldAlert size={18} className="text-zinc-800 group-hover:text-white" />
                        <div><p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">Player Member</p><p className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Akses dashboard standar pemain</p></div>
                      </button>
                      <button onClick={() => { setSelectedPlayer({...selectedPlayer, role: 'admin'}); setIsDropdownOpen(false); }} className="w-full p-5 flex items-center gap-4 hover:bg-zinc-900 transition-colors text-left group">
                        <ShieldCheck size={18} className="text-red-600" />
                        <div><p className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-none mb-1">Administrator</p><p className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Akses penuh admin panel</p></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleSaveRole} disabled={updating} className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-red-900/20 italic">
                {updating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save System Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SCORING --- */}
      {isScoreModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
             <div className="flex justify-between items-start mb-10 font-['Poppins',sans-serif]">
                <div><h2 className="text-2xl font-semibold uppercase text-white tracking-tight leading-none mb-1">{selectedPlayer.full_name}</h2><p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-sans italic">Performance Assessment</p></div>
                <button onClick={() => setIsScoreModalOpen(false)} className="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
             </div>
             <div className="space-y-5 font-sans">
                <InputBox label="Jumlah Gol (x10)" value={selectedPlayer.goals} onChange={(val: any) => setSelectedPlayer({...selectedPlayer, goals: val})} />
                <InputBox label="Attitude (0-100)" value={selectedPlayer.attitude_score} onChange={(val: any) => setSelectedPlayer({...selectedPlayer, attitude_score: val})} />
                <InputBox label="Absensi (x5)" value={selectedPlayer.attendance_count} onChange={(val: any) => setSelectedPlayer({...selectedPlayer, attendance_count: val})} />
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-900">
                   <div><p className="text-[9px] text-zinc-600 font-bold uppercase mb-1 italic tracking-widest">Output Score:</p><p className="text-4xl font-black italic text-white font-['Belleza',sans-serif]">{(selectedPlayer.goals * 10) + (selectedPlayer.attitude_score) + (selectedPlayer.attendance_count * 5)} <span className="text-xs text-amber-500 not-italic uppercase">PTS</span></p></div>
                   <button onClick={handleSaveScore} disabled={updating} className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black px-10 py-5 rounded-[1.2rem] font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl italic">{updating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Sync Stats</button>
                </div>
             </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function InputBox({ label, value, onChange }: any) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl transition-all focus-within:border-amber-500/30 group">
      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block italic group-focus-within:text-amber-500 leading-none">{label}</label>
      <input type="number" value={value || 0} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-white font-bold italic text-3xl outline-none font-['Belleza',sans-serif]" />
    </div>
  );
}