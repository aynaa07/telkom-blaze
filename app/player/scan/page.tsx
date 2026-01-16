'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, RefreshCcw, ShieldAlert, QrCode } from 'lucide-react';

export default function PlayerScan() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (status !== 'idle') return;
    
    // Konfigurasi scanner khusus layar HP
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 20, 
        qrbox: { width: 220, height: 220 }, // Ukuran kotak scan di HP
        aspectRatio: 1.0 
      }, 
      false
    );

    scanner.render(async (decodedText) => {
      try {
        await scanner.clear();
        handleAttendance(decodedText);
      } catch (e) { console.error(e); }
    }, () => {});

    return () => { scanner.clear().catch(() => {}); };
  }, [status]);

  const handleAttendance = async (qrData: string) => {
    setStatus('loading');
    
    try {
      const [sessionName, timestamp] = qrData.split('|');
      const creationTime = parseInt(timestamp);
      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      if (isNaN(creationTime) || (currentTime - creationTime) > oneHour) {
        throw new Error("KODE QR EXPIRED! Minta Admin buat kode baru.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Gagal mengenali user.");

      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase.from('attendance_logs')
        .select('id')
        .eq('player_id', user.id)
        .eq('session_name', sessionName)
        .gte('created_at', today);

      if (existing && existing.length > 0) throw new Error("Sabar, kamu sudah absen hari ini!");

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      await supabase.from('attendance_logs').insert({ player_id: user.id, session_name: sessionName });
      
      const newCount = (profile.attendance_count || 0) + 1;
      const newScore = ((profile.goals || 0) * 10) + (profile.attitude_score || 0) + (newCount * 5);
      
      await supabase.from('profiles').update({ attendance_count: newCount, score: newScore }).eq('id', user.id);

      setMsg(sessionName);
      setStatus('success');
    } catch (error: any) {
      setMsg(error.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen flex items-center justify-center font-['Belleza',sans-serif]">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 md:p-10 text-center relative overflow-hidden shadow-2xl">
        
        {/* Glow Line Atas */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>

        {status === 'idle' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-red-600/10 p-3 rounded-2xl border border-red-600/20">
                <QrCode className="text-red-600" size={28} />
              </div>
            </div>
            
            <h2 className="text-2xl font-black italic uppercase text-white mb-2 leading-none font-['Poppins',sans-serif]">
              SCAN <span className="text-red-600">ABSEN</span>
            </h2>
            
            <p className="text-zinc-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-8 italic">
                Arahkan kamera ke Kode QR dari Admin
            </p>

            <div className="relative mx-auto max-w-[260px]">
              <div id="reader" className="overflow-hidden rounded-[2rem] border-2 border-zinc-900 bg-zinc-900/40"></div>
              {/* Siku-siku Scanner */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-red-600 rounded-tl-xl pointer-events-none"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-red-600 rounded-br-xl pointer-events-none"></div>
            </div>

            <p className="mt-8 text-[8px] text-zinc-700 font-bold uppercase tracking-[0.4em] italic leading-none animate-pulse font-sans">
               // Menunggu Sensor...
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="animate-spin text-red-600 mb-6" size={48} />
            <p className="text-white font-bold italic tracking-widest uppercase text-[10px] font-['Poppins',sans-serif]">Memproses ID...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 animate-in zoom-in duration-500 font-sans">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
               <CheckCircle2 className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase mb-2 font-['Poppins',sans-serif]">BERHASIL!</h2>
            <div className="bg-zinc-900/50 py-2 px-4 rounded-xl border border-zinc-800 w-fit mx-auto mb-10">
               <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest italic">{msg}</p>
            </div>
            <button 
              onClick={() => setStatus('idle')} 
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 tracking-[0.2em] active:scale-95 transition-all shadow-xl"
            >
              <RefreshCcw size={16}/> Scan Lagi
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 animate-in zoom-in duration-500 font-sans">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/20">
               <ShieldAlert className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase mb-2 leading-none font-['Poppins',sans-serif]">GAGAL</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-10 px-4 leading-relaxed italic">{msg}</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        #reader__dashboard_section_csr { display: none; }
        #reader__camera_selection { 
          background: #18181b; 
          color: white; 
          border: 1px solid #27272a; 
          padding: 8px; 
          border-radius: 12px;
          font-size: 10px;
          margin-bottom: 10px;
          width: 100%;
        }
        #reader img { display: none; }
        button#html5-qrcode-button-camera-permission {
          background-color: #dc2626;
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.1em;
          border: none;
        }
      `}</style>
    </div>
  );
}