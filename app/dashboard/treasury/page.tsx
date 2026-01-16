'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, Clock, CheckCircle2, 
  Loader2, X, Send, ChevronDown, QrCode, CreditCard,
  ShieldCheck, Banknote, AlertCircle, Upload, Camera
} from 'lucide-react';

export default function PlayerTreasury() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('20000');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'Kas Week 1', label: 'KAS MINGGU 1' },
    { id: 'Kas Week 2', label: 'KAS MINGGU 2' },
    { id: 'Kas Week 3', label: 'KAS MINGGU 3' },
    { id: 'Kas Week 4', label: 'KAS MINGGU 4' },
    { id: 'Jersey', label: 'PEMBAYARAN JERSEY' },
    { id: 'Turnamen', label: 'BIAYA TURNAMEN' },
  ];

  useEffect(() => { 
    fetchHistory();
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
    if (!category || !proofFile) return alert("Kategori & Bukti Transfer wajib diisi!");
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. UPLOAD FOTO KE STORAGE
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // 2. INPUT DATA TRANSAKSI
      const { error: txError } = await supabase.from('treasury_transactions').insert({
        user_id: user?.id,
        amount: parseInt(amount),
        category: category,
        proof_url: publicUrl,
        status: 'pending'
      });

      if (txError) throw txError;

      // 3. AUTO-NOTIF KE BENDAHARA
      await supabase.from('notifications').insert({
        title: "KONFIRMASI PEMBAYARAN",
        message: `Ada pembayaran baru dari player untuk ${category}. Segera cek bukti transfer!`,
        type: 'treasury',
        is_broadcast: true // Admin/Bendahara bakal dapet notif ini
      });

      alert("BUKTI TERKIRIM! Bendahara akan memverifikasi segera.");
      setShowPayModal(false);
      setProofFile(null);
      fetchHistory();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-belleza">
      
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 font-alice">
        <h1 className="text-5xl md:text-7xl uppercase tracking-tighter">
          THE <span className="text-red-600">TREASURY</span>
        </h1>
        <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
          <ShieldCheck size={20} className="text-red-600 animate-pulse" />
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-belleza">Fast Verification System</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT FORM */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[3rem] shadow-2xl space-y-8">
            <h3 className="text-[10px] uppercase text-red-600 tracking-widest flex items-center gap-3 font-bold">
               <CreditCard size={14}/> Initialization
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 uppercase ml-2 tracking-widest font-belleza">Category</label>
                <select 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border-2 border-zinc-800 p-5 rounded-2xl text-[12px] font-belleza text-white focus:border-red-600 outline-none uppercase"
                >
                  <option value="">SELECT CATEGORY...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 uppercase ml-2 tracking-widest font-belleza">Upload Bukti Transfer</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed p-8 rounded-2xl flex flex-col items-center gap-3 transition-all ${proofFile ? 'border-green-600 bg-green-600/5' : 'border-zinc-800 group-hover:border-red-600'}`}>
                    {proofFile ? <CheckCircle2 className="text-green-600" /> : <Camera className="text-zinc-600" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {proofFile ? proofFile.name : 'AMBIL FOTO / UPLOAD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handlePaymentRequest}
              disabled={loading}
              className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-6 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : 'SUBMIT INTEL'} <Send size={18}/>
            </button>
          </div>
        </div>

        {/* LOG HISTORY */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-10 shadow-inner">
          <h3 className="text-[11px] uppercase text-zinc-500 tracking-[0.4em] mb-10 flex items-center gap-3">
            <Clock size={18} className="text-red-600"/> Financial Log
          </h3>
          {/* ... MAPPING HISTORY SAMA SEPERTI SEBELUMNYA ... */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto hide-scrollbar pr-2">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-6 bg-black border border-zinc-900 rounded-[2rem] hover:border-red-600/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.status === 'approved' ? 'bg-green-600/5 text-green-500 border-green-600/20' : 'bg-amber-600/5 text-amber-600 border-amber-600/20 animate-pulse'}`}>
                    {tx.status === 'approved' ? <CheckCircle2 size={24}/> : <Loader2 size={24} className="animate-spin"/>}
                  </div>
                  <div>
                    <p className="text-[14px] uppercase font-bold text-white leading-none mb-2">{tx.category}</p>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest">VERIFICATION: {tx.status.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold italic leading-none mb-2 text-white font-belleza">Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                  {tx.proof_url && (
                    <a href={tx.proof_url} target="_blank" className="text-[8px] text-red-600 underline font-black tracking-widest">VIEW PROOF</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}