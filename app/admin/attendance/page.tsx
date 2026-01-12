'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Users, QrCode, ClipboardList, Loader2, 
  UserCheck, Search, Clock, Camera, X, 
  Trophy, Activity, TrendingUp
} from 'lucide-react';

export default function AdminAttendance() {
  const [sessionName, setSessionName] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  // --- LOGIKA SCANNER (ADMIN) ---
  useEffect(() => {
    if (!showScanner) return;
    const scanner = new Html5QrcodeScanner("admin-reader", { 
      fps: 10, qrbox: { width: 250, height: 250 } 
    }, false);

    const onScanSuccess = async (decodedText: string) => {
      try {
        await scanner.clear();
        setShowScanner(false);
        handleAdminOwnAttendance(decodedText);
      } catch (err) { console.error(err); }
    };
    scanner.render(onScanSuccess, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, [showScanner]);

  async function fetchInitialData() {
    setLoading(true);
    const [logsRes, playersRes] = await Promise.all([
      supabase.from('attendance_logs').select('*, profiles(full_name, nim)').order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('*').order('attendance_count', { ascending: false })
    ]);
    if (logsRes.data) setLogs(logsRes.data);
    if (playersRes.data) setPlayers(playersRes.data);
    setLoading(false);
  }

  const generateQR = () => {
    if (!sessionName) return alert("Tentukan Nama Sesi Latihan!");
    const timestamp = new Date().getTime();
    setQrValue(`${sessionName}|${timestamp}`);
  };

  const handleAdminOwnAttendance = async (qrData: string) => {
    const [name, timestamp] = qrData.split('|');
    if (new Date().getTime() - parseInt(timestamp) > 3600000) return alert("QR EXPIRED!");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('attendance_logs').insert({ 
      player_id: user.id, session_name: name 
    });
    if (!error) { alert("Attendance Recorded!"); fetchInitialData(); }
  };

  const handleManualAttendance = async (player: any) => {
    if (!sessionName) return alert("Isi Nama Sesi di kolom 'Session Deployment' dulu!");
    if (confirm(`Absen manual untuk ${player.full_name}?`)) {
      try {
        const { error: logError } = await supabase.from('attendance_logs').insert({ 
          player_id: player.id, session_name: sessionName 
        });
        if (logError) throw logError;

        const { data: profile, error: profileErr } = await supabase
          .from('profiles').select('attendance_count, goals, attitude_score')
          .eq('id', player.id).single();

        if (profileErr || !profile) throw new Error("Gagal ambil profil.");

        const currentCount = profile.attendance_count || 0;
        const newCount = currentCount + 1;
        const newTotalScore = ((profile.goals || 0) * 10) + (profile.attitude_score || 0) + (newCount * 5);

        const { error: updateError } = await supabase.from('profiles')
          .update({ attendance_count: newCount, score: newTotalScore }).eq('id', player.id);

        if (updateError) throw updateError;
        await fetchInitialData(); 
      } catch (err: any) { alert("Error: " + err.message); }
    }
  };

  const filteredPlayers = players.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && players.length === 0) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans">
      {/* HEADER */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
          ATTENDANCE <span className="text-red-600">COMMAND</span>
        </h1>
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic">// Intelligence & Squad Logs</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: CONTROLS (QR & SCAN) */}
        <div className="w-full lg:w-1/3 order-1 lg:order-1">
          <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <QrCode className="text-red-600" size={18} />
              <h2 className="font-black italic uppercase text-[10px] tracking-widest text-white/80">Session Deployment</h2>
            </div>
            
            <input 
              type="text" placeholder="Session Name (Ex: Training A)" value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-4 rounded-xl md:rounded-2xl mb-4 font-bold outline-none focus:border-red-600 text-sm transition-all placeholder:text-zinc-800"
            />
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={generateQR} className="bg-red-600 hover:bg-red-700 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] italic transition-all active:scale-95 shadow-lg">Create QR</button>
              <button 
                onClick={() => setShowScanner(!showScanner)} 
                className={`py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] italic border flex items-center justify-center gap-2 transition-all ${showScanner ? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
              >
                {showScanner ? <X size={14}/> : <Camera size={14}/>} {showScanner ? 'Close' : 'Scan'}
              </button>
            </div>

            {showScanner && (
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border-2 border-red-600">
                <div id="admin-reader"></div>
              </div>
            )}

            {qrValue && !showScanner && (
              <div className="mt-4 p-6 md:p-8 bg-white rounded-[2rem] flex flex-col items-center animate-in zoom-in duration-500 shadow-2xl">
                <QRCodeSVG value={qrValue} size={160} />
                <p className="text-black font-black mt-4 uppercase italic text-center leading-tight text-[11px]">{sessionName}</p>
                <div className="mt-3 flex items-center gap-2 text-[8px] text-zinc-400 font-black uppercase">
                   <Clock size={10} /> Expire: 60m
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: LIST (STATS & SQUAD) */}
        <div className="w-full lg:w-2/3 order-2 lg:order-2 space-y-6">
          
          {/* TOP MINI STATS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-zinc-950 border border-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem]">
              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1 md:mb-2 flex items-center gap-2"><Activity size={10} className="text-red-600" /> Logs</p>
              <span className="text-2xl md:text-4xl font-black italic text-white leading-none">{logs.length}</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem]">
              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1 md:mb-2 flex items-center gap-2"><TrendingUp size={10} className="text-green-500" /> Rate</p>
              <span className="text-2xl md:text-4xl font-black italic text-green-500 leading-none">
                {players.length > 0 ? Math.round((logs.length / (players.length * 5)) * 100) : 0}%
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-l-4 border-red-600 col-span-2 md:col-span-1">
              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">Current</p>
              <p className="text-sm md:text-lg font-black italic text-white uppercase truncate">{sessionName || "No Mission"}</p>
            </div>
          </div>

          {/* SQUAD LIST */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/10">
              <h2 className="font-black italic uppercase text-xs tracking-tight flex items-center gap-2 text-white">
                <Users className="text-red-600" size={16} /> Squad Performance
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                <input 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Find Member..." 
                  className="bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold outline-none focus:border-red-600 w-full transition-all"
                />
              </div>
            </div>
            
            {/* DESKTOP TABLE (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black text-[9px] font-black uppercase text-zinc-700 tracking-[0.2em] border-b border-zinc-900">
                  <tr>
                    <th className="p-6">Squad Member</th>
                    <th className="p-6 text-center">Sessions</th>
                    <th className="p-6 text-center">Score</th>
                    <th className="p-6 text-center">Reliability</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredPlayers.map(player => (
                    <PlayerRow key={player.id} player={player} handleManual={handleManualAttendance} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST (Hidden on Desktop) */}
            <div className="md:hidden divide-y divide-zinc-900">
              {filteredPlayers.map(player => (
                <PlayerCardMobile key={player.id} player={player} handleManual={handleManualAttendance} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS UNTUK KERAPIHAN ---

function PlayerRow({ player, handleManual }: any) {
  const sessions = player.attendance_count || 0;
  const percentage = Math.min(Math.round((sessions / 10) * 100), 100);

  return (
    <tr className="hover:bg-zinc-900/40 transition-all group">
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover rounded-xl" /> : <Users size={16} className="text-zinc-800" />}
          </div>
          <div>
            <p className="font-black italic text-sm uppercase tracking-tighter text-white leading-none mb-1">{player.full_name}</p>
            <p className="text-[9px] text-zinc-700 font-mono tracking-widest">{player.nim}</p>
          </div>
        </div>
      </td>
      <td className="p-6 text-center font-black italic text-sm">{sessions}</td>
      <td className="p-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/5 border border-blue-600/20 rounded-lg">
          <Trophy size={10} className="text-blue-500" />
          <span className="text-[10px] font-black text-blue-500">+{sessions * 5}</span>
        </div>
      </td>
      <td className="p-6 text-center min-w-[150px]">
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-1">
          <div className={`h-full ${percentage > 70 ? 'bg-green-500' : 'bg-red-600'}`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-[8px] font-black text-zinc-700 uppercase italic">{percentage}%</span>
      </td>
      <td className="p-6 text-right">
        <button onClick={() => handleManual(player)} className="p-3 bg-green-600/10 text-green-500 rounded-xl border border-green-600/20 hover:bg-green-600 hover:text-white transition-all"><UserCheck size={16} /></button>
      </td>
    </tr>
  );
}

function PlayerCardMobile({ player, handleManual }: any) {
  const sessions = player.attendance_count || 0;
  return (
    <div className="p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
          {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover" /> : <Users size={18} className="text-zinc-800" />}
        </div>
        <div>
          <p className="font-black italic text-[11px] uppercase text-white leading-none mb-1">{player.full_name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-red-600 italic uppercase tracking-tighter">{sessions} SESSIONS</span>
            <span className="text-[8px] text-zinc-700 font-mono">{player.nim}</span>
          </div>
        </div>
      </div>
      <button 
        onClick={() => handleManual(player)}
        className="h-11 w-11 flex items-center justify-center bg-green-600 rounded-xl text-white shadow-lg active:scale-90 transition-transform"
      >
        <UserCheck size={18} />
      </button>
    </div>
  );
}