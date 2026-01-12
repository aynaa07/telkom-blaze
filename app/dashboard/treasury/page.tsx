'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, Clock, CheckCircle2, 
  Loader2, X, Send, ChevronDown, QrCode, CreditCard
} from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  type: string;
  category: string;
  status: string;
  created_at: string;
};

export default function PlayerTreasury() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('20000');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'Kas Week 1', label: 'KAS MINGGU 1' },
    { id: 'Kas Week 2', label: 'KAS MINGGU 2' },
    { id: 'Kas Week 3', label: 'KAS MINGGU 3' },
    { id: 'Kas Week 4', label: 'KAS MINGGU 4' },
    { id: 'Jersey', label: 'PEMBAYARAN JERSEY' },
    { id: 'Turnamen', label: 'BIAYA TURNAMEN' },
    { id: 'PT Pelatih', label: 'PT PELATIH (URUNAN)' },
  ];

  useEffect(() => { 
    fetchHistory();
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('treasury_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
    }
  }

  async function handlePaymentRequest() {
    if (!category) return alert("Pilih kategori pembayaran dulu mas!");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('treasury_transactions').insert({
      user_id: user?.id,
      amount: parseInt(amount),
      type: 'income',
      category: category,
      description: `Request payment for ${category}`,
      status: 'pending'
    });

    if (!error) {
      alert("Request Sent! Mohon tunggu verifikasi admin.");
      setShowQR(false);
      setCategory('');
      fetchHistory();
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-sans">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
          THE <span className="text-red-600">TREASURY</span>
        </h1>
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic tracking-widest leading-none">// Personal Financial Log</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI: DROPDOWN FORM */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] relative shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-red-600 mb-8 italic tracking-widest flex items-center gap-2 leading-none">
               <CreditCard size={14}/> Initialization
            </h3>

            <div className="space-y-6 mb-10">
              {/* DROPDOWN SELECTOR */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 italic tracking-widest leading-none">Category</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-black border p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${isDropdownOpen ? 'border-red-600' : 'border-zinc-800'}`}
                >
                  <span className={`text-[11px] font-black italic uppercase ${!category ? 'text-zinc-700' : 'text-white'}`}>
                    {category ? categories.find(c => c.id === category)?.label : 'SELECT CATEGORY...'}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-[100] w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setCategory(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-5 py-4 text-[10px] font-black italic uppercase cursor-pointer transition-colors ${category === cat.id ? 'bg-red-600 text-white' : 'hover:bg-zinc-800 text-zinc-500 hover:text-white'}`}
                        >
                          {cat.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NOMINAL INPUT */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 italic tracking-widest leading-none">Amount (Rp)</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-lg font-black italic outline-none focus:border-red-600 transition-all text-white"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setShowQR(true)}
              className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 italic"
            >
              GENERATE QRIS <Send size={16}/>
            </button>
          </div>
        </div>

        {/* KANAN: HISTORY (STAY SAME) */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
          <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-[0.3em] italic flex items-center gap-3">
            <Clock size={16} className="text-red-600"/> Personal Transaction Log
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
            {history.length > 0 ? history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-5 bg-black border border-zinc-900 rounded-2xl group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl ${tx.status === 'approved' ? 'bg-green-600/10 text-green-600' : 'bg-amber-600/10 text-amber-600 animate-pulse'}`}>
                    {tx.status === 'approved' ? <CheckCircle2 size={18}/> : <Loader2 size={18} className="animate-spin"/>}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase italic tracking-wider leading-none mb-1">{tx.category}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-md font-black italic tracking-tighter leading-none mb-1">Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${tx.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl opacity-20 font-black uppercase italic text-[10px] tracking-widest">
                No Financial Intelligence Found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL QRIS */}
      {showQR && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3.5rem] max-w-sm w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
             
             <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24}/></button>
             
             <h3 className="text-2xl font-black italic uppercase mb-1 tracking-tight">SCAN <span className="text-red-600">QRIS</span></h3>
             <p className="text-[9px] text-zinc-600 font-black uppercase mb-10 tracking-[0.3em] italic opacity-60 leading-none">// Blaze Community Fund</p>
             
             <div className="bg-white p-3 rounded-[2.5rem] mb-10 aspect-square flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-red-600/10">
                <img 
                    src="/qris.jpeg" 
                    alt="Telkom Blaze QRIS"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.currentTarget.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TelkomBlazeTreasury";
                    }}
                />
             </div>

             <div className="bg-black/50 border border-zinc-900 p-6 rounded-[1.5rem] mb-8">
                <p className="text-[10px] text-zinc-500 font-bold italic uppercase leading-relaxed tracking-wider">
                  Transfer <span className="text-white">Rp {parseInt(amount).toLocaleString('id-ID')}</span> tepat, <br/>Lalu klik tombol di bawah untuk verifikasi.
                </p>
             </div>

             <button 
               onClick={handlePaymentRequest}
               disabled={loading}
               className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
             >
               {loading ? <Loader2 className="animate-spin" size={18}/> : "I'VE PAID, ACC ME"}
             </button>
          </div>
        </div>
      )}

      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}