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
    
    // Konfigurasi Scanner yang lebih pas untuk HP
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 15, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 // Kotak sempurna untuk tampilan mobile
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
        throw new Error("QR CODE EXPIRED! Minta Admin generate kode baru.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User Not Authenticated");

      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase.from('attendance_logs')
        .select('id')
        .eq('player_id', user.id)
        .eq('session_name', sessionName)
        .gte('created_at', today);

      if (existing && existing.length > 0) throw new Error("Anda sudah absen hari ini!");

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
    <div className="p-4 md:p-10 bg-black min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 text-center relative overflow-hidden shadow-2xl">
        {/* Glow Effect Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>

        {status === 'idle' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-red-600/10 p-3 rounded-2xl border border-red-600/20">
                <QrCode className="text-red-600" size={24} />
              </div>
            </div>
            
            <h2 className="text-2xl font-black italic uppercase text-white mb-2 leading-none">
              SCAN <span className="text-red-600 text-shadow-glow">ATTENDANCE</span>
            </h2>
            
            {/* TULISAN SEBELUM SCAN - DIBUAT PUTIH TERANG */}
            <p className="text-white font-bold text-[10px] uppercase tracking-widest mb-8 opacity-100 italic">
               Ready to Scan. Position the QR code within the frame.
            </p>

            <div className="relative">
              <div id="reader" className="overflow-hidden rounded-3xl border-2 border-zinc-900 bg-zinc-900/40 shadow-inner overflow-hidden"></div>
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-red-600 rounded-tl-lg pointer-events-none"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-red-600 rounded-br-lg pointer-events-none"></div>
            </div>

            <p className="mt-8 text-[9px] text-zinc-500 font-black uppercase tracking-[0.4em] italic leading-none animate-pulse">
               // Tracking Personnel ID...
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center">
            <div className="relative">
               <Loader2 className="animate-spin text-red-600 mb-6" size={60} />
               <div className="absolute inset-0 blur-2xl bg-red-600/20 rounded-full"></div>
            </div>
            <p className="text-white font-black italic tracking-widest uppercase text-xs">Verifying Tactical ID...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
               <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-2">IDENTIFIED</h2>
            <div className="bg-zinc-900/50 py-2 px-4 rounded-full border border-zinc-900 w-fit mx-auto mb-10">
               <p className="text-green-500 text-[9px] font-black uppercase tracking-widest italic">{msg}</p>
            </div>
            <button 
              onClick={() => setStatus('idle')} 
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 tracking-[0.2em] transition-all active:scale-95 shadow-xl italic"
            >
              <RefreshCcw size={16}/> Re-Scan Sensor
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
               <ShieldAlert className="text-red-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-2 leading-none">MISSION DENIED</h2>
            <p className="text-red-500/70 text-[10px] font-bold uppercase tracking-widest mb-10 px-4 leading-relaxed">{msg}</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-900/40 active:scale-95 italic"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        #reader__dashboard_section_csr { display: none; }
        #reader__camera_selection { 
          background: black; 
          color: white; 
          border: 1px solid #27272a; 
          padding: 8px; 
          border-radius: 12px;
          font-size: 10px;
          margin-bottom: 10px;
        }
        #reader img { display: none; }
        .text-shadow-glow { text-shadow: 0 0 15px rgba(220, 38, 38, 0.5); }
        button#html5-qrcode-button-camera-permission {
          background-color: #dc2626;
          color: white;
          padding: 12px 24px;
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