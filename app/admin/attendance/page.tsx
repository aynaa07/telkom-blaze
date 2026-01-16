'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Users, QrCode, Loader2, Search, 
  History as HistoryIcon, PenTool, Printer, Camera, X, Scan, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function AdminAttendance() {
  const [activeTab, setActiveTab] = useState<'deployment' | 'squad' | 'history'>('deployment');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showScanner, setShowScanner] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const sigCanvas = useRef<any>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [logsRes, pRes] = await Promise.all([
        supabase.from('attendance_logs').select('*, profiles(full_name, nim, prodi)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('full_name')
      ]);
      if (logsRes.data) setLogs(logsRes.data);
      if (pRes.data) setPlayers(pRes.data);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    setTimeout(() => { window.print(); }, 800);
  };

  async function submitAbsen() {
    if (sigCanvas.current.isEmpty()) return alert("Tanda tangan wajib!");
    const sigData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    const { error } = await supabase.from('attendance_logs').insert({ 
      player_id: selectedPlayer.id, 
      session_name: sessionName || 'Latihan Rutin',
      signature_data: sigData 
    });
    if (!error) { setShowSigModal(false); fetchData(); }
  }

  const sessions = Array.from(new Set(logs.map(l => l.session_name)));

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Loading Data...</p>
    </div>
  );

  return (
    // Menggunakan font Belleza dengan fallback sans-serif
    <div className="p-4 md:p-8 bg-black min-h-screen text-white font-['Belleza',sans-serif] selection:bg-red-600">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col gap-5 no-print">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
            SQUAD <span className="text-red-600">INTEL</span>
          </h1>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold mt-2">
            // Attendance Management System
          </p>
        </div>
        
        <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded-xl overflow-x-auto no-scrollbar shadow-lg">
          <TabButton active={activeTab === 'deployment'} onClick={() => {setActiveTab('deployment'); setSelectedSession(null)}} label="Mission" icon={<Scan size={14}/>} />
          <TabButton active={activeTab === 'squad'} onClick={() => {setActiveTab('squad'); setSelectedSession(null)}} label="Squad" icon={<Users size={14}/>} />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" icon={<HistoryIcon size={14}/>} />
        </div>
      </div>

      {/* --- TAB: MISSION --- */}
      {activeTab === 'deployment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in no-print">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl shadow-md">
            <h3 className="text-[10px] uppercase text-red-600 mb-6 font-bold tracking-widest">Session Control</h3>
            <input 
              placeholder="Session Name..." value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-4 rounded-xl mb-4 font-bold outline-none focus:border-red-600 uppercase text-white text-sm transition-all"
            />
            <div className="flex flex-col gap-3">
              <button onClick={() => setQrValue(sessionName)} className="w-full bg-red-600 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all">Generate QR</button>
              <button onClick={() => setShowScanner(!showScanner)} className="w-full bg-zinc-900 border border-zinc-800 py-3.5 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 tracking-widest active:scale-95 transition-all">
                {showScanner ? <X size={14}/> : <Camera size={14}/>} {showScanner ? 'Close' : 'Camera Scan'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-3xl p-8 min-h-[300px]">
            {showScanner ? (
              <div id="admin-reader" className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-red-600 shadow-xl"></div>
            ) : qrValue ? (
              <div className="p-6 bg-white rounded-2xl shadow-xl flex flex-col items-center animate-in zoom-in">
                <QRCodeSVG value={qrValue} size={200} />
                <p className="text-black font-bold mt-4 uppercase text-sm tracking-tight">{sessionName}</p>
              </div>
            ) : <p className="opacity-20 italic font-bold uppercase tracking-widest text-[10px]">Ready for session deployment</p>}
          </div>
        </div>
      )}

      {/* --- TAB: SQUAD LIST --- */}
      {activeTab === 'squad' && (
        <div className="space-y-4 no-print animate-in fade-in">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
              <input placeholder="Search squad member..." onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 py-3.5 pl-12 pr-6 rounded-2xl text-xs font-bold uppercase outline-none focus:border-red-600 tracking-wider transition-all" />
           </div>
           <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-md">
              <div className="divide-y divide-zinc-900">
                {players.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div key={p.id} className="p-5 flex justify-between items-center hover:bg-zinc-900 transition-colors group">
                    <div>
                      <p className="text-white font-bold text-base md:text-lg uppercase tracking-tight leading-tight">{p.full_name}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">{p.nim} // {p.prodi}</p>
                    </div>
                    <button onClick={() => { setSelectedPlayer(p); setShowSigModal(true); }} className="p-3.5 bg-green-600/10 text-green-500 rounded-xl border border-green-600/20 hover:bg-green-600 hover:text-white transition-all active:scale-95">
                      <PenTool size={18} />
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* --- TAB: HISTORY --- */}
      {activeTab === 'history' && (
        <div className="animate-in fade-in space-y-4">
          {!selectedSession ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
              {sessions.map((s, i) => (
                <button 
                  key={i} onClick={() => setSelectedSession(s)}
                  className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex justify-between items-center group hover:border-red-600 transition-all text-left shadow-sm hover:shadow-red-600/10"
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase text-zinc-600 tracking-widest mb-1 block">Archive Session</span>
                    <p className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-red-600 transition-colors">{s}</p>
                    <p className="text-[10px] text-zinc-700 font-bold mt-1 uppercase">
                      {logs.filter(l => l.session_name === s).length} Personnel Present
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-800 group-hover:text-red-600 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center no-print px-1">
                <button onClick={() => setSelectedSession(null)} className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2 hover:text-white transition-all">
                  <ChevronLeft size={16}/> Back to Archive
                </button>
                <button onClick={handlePrint} className="bg-white text-black px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-lg">
                  <Printer size={16}/> Save PDF
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden print-area shadow-lg">
                <div className="hidden print:flex flex-row items-center justify-between mb-8 border-b border-black pb-4 text-black p-4">
                  <img src="/logo-telkom.png" alt="Logo" className="w-14 h-14 object-contain" />
                  <div className="flex-1 text-center px-4">
                    <h2 className="text-base font-bold uppercase font-['Belleza',sans-serif]">Telkom University Kampus Jakarta</h2>
                    <p className="text-[8px]">Jl. Raya Daan Mogot No.KM. 11, RW.4, Kedaung Kali Angke, Cengkareng, Jakarta Barat 11710</p>
                    <h3 className="text-[11px] font-bold mt-3 underline uppercase">Report: {selectedSession}</h3>
                  </div>
                  <img src="/logo-ukm.png" alt="Logo" className="w-14 h-14 object-contain" />
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left print:text-black">
                    <thead className="bg-zinc-900/50 text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-900 print:bg-zinc-100 print:text-black print:border-black">
                      <tr>
                        <th className="p-4 border-r border-zinc-900 print:border-black text-center w-12">NO</th>
                        <th className="p-4 border-r border-zinc-900 print:border-black">PLAYER INFO</th>
                        <th className="p-4 text-center print:border-black w-32">SIGNATURE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 print:divide-black font-medium text-xs uppercase">
                      {logs.filter(l => l.session_name === selectedSession).map((log, idx) => (
                        <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors print:text-black">
                          <td className="p-4 border-r border-zinc-900 print:border-black text-center text-zinc-600 print:text-black">{idx + 1}</td>
                          <td className="p-4 border-r border-zinc-900 print:border-black">
                            <p className="text-sm font-bold tracking-tight">{log.profiles?.full_name}</p>
                            <p className="text-[9px] text-zinc-600 font-medium tracking-wider print:text-zinc-500">{log.profiles?.nim} // {log.profiles?.prodi}</p>
                          </td>
                          <td className="p-2 h-[60px] flex items-center justify-center">
                            {log.signature_data && (
                              <img src={log.signature_data} alt="sig" className="h-10 w-auto grayscale brightness-0 contrast-200 object-contain" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SIGNATURE MODAL --- */}
      {showSigModal && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm">
            <h3 className="text-center text-lg font-bold uppercase tracking-tight mb-1">Authorization</h3>
            <p className="text-center text-[10px] text-zinc-600 mb-6 uppercase tracking-widest">{selectedPlayer?.full_name}</p>
            
            <div className="bg-white rounded-xl overflow-hidden border-2 border-zinc-800 mb-6 touch-none">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor='black' 
                canvasProps={{ style: { width: '100%', height: '160px' }, className: 'sigCanvas' }} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => sigCanvas.current.clear()} className="bg-zinc-900 py-3 rounded-xl uppercase text-[10px] font-bold text-zinc-500">Clear</button>
              <button onClick={submitAbsen} className="bg-red-600 py-3 rounded-xl uppercase text-[10px] font-bold shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Menghubungkan font Belleza dari Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Belleza&display=swap');

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          body * { visibility: hidden; background: white !important; font-family: 'Belleza', sans-serif !important; }
          .no-print { display: none !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          img { visibility: visible !important; display: block !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid black !important; }
          th, td { border: 1px solid black !important; color: black !important; padding: 8px !important; }
        }
      `}</style>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase transition-all shrink-0 ${active ? 'bg-red-600 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-200'}`}>
      {icon} <span className="tracking-wider">{label}</span>
    </button>
  );
}