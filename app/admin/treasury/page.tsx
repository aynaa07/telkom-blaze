'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Check, X, Loader2, Wallet, Users, Receipt, 
  Search, CreditCard, TrendingUp, TrendingDown, 
  Plus, Trash2, Eye, ExternalLink, Calendar
} from 'lucide-react';

export default function AdminTreasury() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cashflow' | 'confirm' | 'checklist'>('cashflow');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, balance: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  // WAKTU STATES UNTUK REKAP KAS
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showModal, setShowModal] = useState<{show: boolean, type: 'income' | 'expense' | null}>({ show: false, type: null });
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({ amount: '', desc: '', cat: 'Sewa Lapangan' });

  const weeks = [1, 2, 3, 4];
  const months = [
    { n: 1, s: 'Jan' }, { n: 2, s: 'Feb' }, { n: 3, s: 'Mar' }, { n: 4, s: 'Apr' },
    { n: 5, s: 'Mei' }, { n: 6, s: 'Jun' }, { n: 7, s: 'Jul' }, { n: 8, s: 'Agu' },
    { n: 9, s: 'Sep' }, { n: 10, s: 'Okt' }, { n: 11, s: 'Nov' }, { n: 12, s: 'Des' }
  ];

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear, activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      const [txRes, pRes, wRes] = await Promise.all([
        supabase.from('treasury_transactions').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, role').order('full_name'),
        // PERBAIKAN: Filter data rekap kas berdasarkan tahun dan bulan yang dipilih mas
        supabase.from('weekly_dues').select('*').eq('year', selectedYear).eq('month_number', selectedMonth)
      ]);
      
      if (txRes.data) {
        setTransactions(txRes.data);
        const approved = txRes.data.filter(t => t.status === 'approved');
        const income = approved.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const expense = approved.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        setStats({ total_in: income, total_out: expense, balance: income - expense });
      }
      if (pRes.data) setProfiles(pRes.data);
      if (wRes.data) setWeeklyData(wRes.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string, userId: string, category: string) {
    const { error: txError } = await supabase.from('treasury_transactions').update({ status: 'approved' }).eq('id', id);
    if (!txError) {
      if (category.includes('Kas Week')) {
        const weekMatch = category.match(/\d+/);
        const weekNum = weekMatch ? parseInt(weekMatch[0]) : 1;
        
        // Simpan ke weekly_dues dengan mencatat bulan dan tahun saat ini agar centang muncul
        await supabase.from('weekly_dues').upsert({
          user_id: userId,
          week_number: weekNum,
          month_number: selectedMonth, 
          year: selectedYear,
          is_paid: true,
          transaction_id: id
        });
      }
      fetchData();
    }
  }

  async function addManualTransaction() {
    if (!manualForm.amount || !manualForm.desc) return alert("Isi data nominal dan deskripsi!");
    const { error } = await supabase.from('treasury_transactions').insert({
      amount: parseInt(manualForm.amount),
      description: manualForm.desc,
      category: manualForm.cat,
      type: showModal.type,
      status: 'approved'
    });
    if (!error) {
      setShowModal({ show: false, type: null });
      setManualForm({ amount: '', desc: '', cat: 'Sewa Lapangan' });
      fetchData();
    }
  }

  async function deleteTx(id: string) {
    if(!confirm("Hapus data transaksi ini?")) return;
    await supabase.from('treasury_transactions').delete().eq('id', id);
    fetchData();
  }

  if (loading && profiles.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 animate-pulse">Syncing Financial Data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] selection:bg-red-600">
      
      {/* HEADER - POPPINS */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 font-['Poppins',sans-serif]">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight leading-none text-white">
            Pusat <span className="text-red-600">Keuangan</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-3 opacity-80 font-sans italic">
            // Financial Management System 2026
          </p>
        </div>
        
        <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded-2xl overflow-x-auto no-scrollbar w-full xl:w-auto font-sans shadow-lg">
          <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} label="Arus Kas" icon={<Receipt size={14}/>} />
          <TabButton active={activeTab === 'confirm'} onClick={() => setActiveTab('confirm')} label="Verifikasi" icon={<CreditCard size={14}/>} count={transactions.filter(t => t.status === 'pending').length} />
          <TabButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} label="Rekap Kas" icon={<Users size={14}/>} />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="animate-in fade-in duration-500">
        
        {activeTab === 'cashflow' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard label="Total Pemasukan" amount={stats.total_in} type="in" onAdd={() => { setShowModal({show: true, type: 'income'}); setManualForm(prev => ({...prev, cat: 'Sponsor'})); }} />
              <StatCard label="Total Pengeluaran" amount={stats.total_out} type="out" onAdd={() => { setShowModal({show: true, type: 'expense'}); setManualForm(prev => ({...prev, cat: 'Sewa Lapangan'})); }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <NewTable title="Histori Pemasukan" type="income" data={transactions.filter(t => t.status === 'approved' && t.type === 'income')} onDelete={deleteTx} onViewProof={(url: string) => setSelectedProof(url)} />
              <NewTable title="Histori Pengeluaran" type="expense" data={transactions.filter(t => t.status === 'approved' && t.type === 'expense')} onDelete={deleteTx} onViewProof={(url: string) => setSelectedProof(url)} />
            </div>
          </div>
        )}

        {activeTab === 'confirm' && (
          <div className="max-w-4xl mx-auto space-y-4 font-sans">
            {transactions.filter(t => t.status === 'pending').map((tx) => (
              <ConfirmRow key={tx.id} tx={tx} onApprove={handleApprove} onDelete={deleteTx} onShowProof={(url: string) => setSelectedProof(url)} />
            ))}
            {transactions.filter(t => t.status === 'pending').length === 0 && (
              <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
                <p className="text-xs font-bold uppercase tracking-widest italic">Tidak ada antrean pembayaran</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-8">
            {/* PERIODE PICKER */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl font-sans">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-red-600" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest font-['Poppins',sans-serif]">Pilih Periode Rekap</h3>
              </div>
              
              <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {[2025, 2026, 2027].map(year => (
                  <button 
                    key={year} onClick={() => setSelectedYear(year)}
                    className={`px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${selectedYear === year ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-black border-zinc-800 text-zinc-600 hover:text-white'}`}
                  >
                    Tahun {year}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {months.map(m => (
                  <button 
                    key={m.n} onClick={() => setSelectedMonth(m.n)}
                    className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedMonth === m.n ? 'bg-white border-white text-black shadow-lg scale-105' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:text-white'}`}
                  >
                    {m.s}
                  </button>
                ))}
              </div>
            </div>

            {/* TABEL REKAP - KARTU DATA */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 border-b border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/10">
                <div className="font-['Poppins',sans-serif]">
                  <h3 className="text-xl font-bold uppercase tracking-tight">Rekap Kas <span className="text-red-600">Pemain</span></h3>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">PERIODE: {months.find(m => m.n === selectedMonth)?.s} {selectedYear}</p>
                </div>
                <div className="relative w-full md:w-auto font-sans">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input className="bg-black border border-zinc-800 py-3.5 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase w-full md:w-64 outline-none focus:border-red-600 transition-all" placeholder="Cari nama pemain..." onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-black uppercase text-[10px] font-bold text-zinc-500 tracking-widest border-b border-zinc-900">
                      <th className="px-8 py-6">Nama Anggota</th>
                      {weeks.map(w => <th key={w} className="px-4 py-6 text-center">Minggu {w}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-sans">
                    {profiles.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((player) => (
                      <tr key={player.id} className="hover:bg-zinc-900/20 transition-colors group">
                        <td className="px-8 py-5 text-zinc-300 font-medium group-hover:text-white font-['Poppins',sans-serif]">{player.full_name}</td>
                        {weeks.map(w => {
                          // LOGIKA PENGECEKAN: Cocokkan ID, Minggu, Bulan, dan Tahun
                          const isPaid = weeklyData.some(d => 
                            d.user_id === player.id && 
                            d.week_number === w && 
                            d.month_number === selectedMonth && 
                            d.year === selectedYear
                          );
                          return (
                            <td key={w} className="px-4 py-5">
                              <div className="flex justify-center">
                                {isPaid ? (
                                  <div className="w-9 h-9 bg-green-600/10 text-green-500 rounded-xl flex items-center justify-center border border-green-600/20 shadow-lg shadow-green-950/20 animate-in zoom-in duration-300">
                                    <Check size={18} strokeWidth={4}/>
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 bg-zinc-900/50 rounded-xl flex items-center justify-center text-zinc-800 border border-zinc-900">
                                    <X size={12} className="opacity-20" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL PREVIEW BUKTI */}
      {selectedProof && (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6" onClick={() => setSelectedProof(null)}>
          <div className="relative max-w-2xl w-full bg-zinc-950 p-3 rounded-[2.5rem] border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProof(null)} className="absolute -top-14 right-0 text-white hover:text-red-600 transition-colors flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest font-sans px-5 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
              Tutup Bukti <X size={16}/>
            </button>
            <div className="overflow-hidden rounded-[2rem] bg-black border border-zinc-900">
               <img src={selectedProof} alt="Proof" className="w-full h-auto max-h-[75vh] object-contain mx-auto shadow-2xl" />
            </div>
            <div className="mt-6 flex justify-between items-center px-4 font-sans py-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Digital Treasury Transmission</p>
              <a href={selectedProof} target="_blank" className="text-red-600 hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                Original Image <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT MANUAL */}
      {showModal.show && (
        <div className="fixed inset-0 z-[900] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setShowModal({show: false, type: null})}>
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-8 md:p-10 rounded-t-[3rem] md:rounded-[3rem] max-w-md w-full relative overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans" onClick={e => e.stopPropagation()}>
             <div className={`absolute top-0 left-0 w-full h-2 ${showModal.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}></div>
             <button onClick={() => setShowModal({show: false, type: null})} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
             
             <h3 className="text-2xl font-semibold uppercase mb-8 tracking-tight font-['Poppins',sans-serif]">Input <span className={showModal.type === 'income' ? 'text-green-500' : 'text-red-600'}>{showModal.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></h3>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 leading-none">Deskripsi</label>
                   <input className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm font-semibold uppercase outline-none focus:border-red-600 transition-all text-white font-['Poppins',sans-serif]" placeholder="Contoh: Sponsor Kostum..." value={manualForm.desc} onChange={e => setManualForm({...manualForm, desc: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 leading-none">Kategori</label>
                   <select className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm font-semibold uppercase outline-none cursor-pointer focus:border-red-600 text-white font-bold" value={manualForm.cat} onChange={e => setManualForm({...manualForm, cat: e.target.value})}>
                      {showModal.type === 'income' ? (
                        <><option value="Saldo Awal">Saldo Awal</option><option value="Sponsor">Sponsor</option><option value="Uang Kas">Uang Kas</option><option value="Hibah">Hibah</option></>
                      ) : (
                        <><option value="Sewa Lapangan">Sewa Lapangan</option><option value="Beli Alat/Bola">Beli Alat/Bola</option><option value="Tournament Fee">Biaya Turnamen</option><option value="Lain-lain">Lain-lain</option></>
                      )}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 leading-none">Nominal (Rp)</label>
                   <input type="number" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-2xl font-bold outline-none focus:border-red-600 transition-all text-white font-['Belleza',sans-serif]" placeholder="0" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} />
                </div>
                <button onClick={addManualTransaction} className={`w-full py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-xl mt-4 active:scale-95 ${showModal.type === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    Simpan Transaksi
                </button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 md:px-8 py-3.5 md:py-4 rounded-xl text-[10px] font-bold uppercase transition-all relative shrink-0 ${active ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}>
      {icon} <span className="tracking-widest">{label}</span>
      {count !== undefined && count > 0 && <span className="absolute -top-1 -right-1 bg-white text-red-600 w-5 h-5 rounded-full text-[9px] flex items-center justify-center border-2 border-zinc-950 font-black">{count}</span>}
    </button>
  );
}

function StatCard({ label, amount, type, onAdd }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-7 md:p-10 rounded-[2.5rem] relative overflow-hidden group shadow-lg transition-all hover:border-zinc-800">
      <button onClick={onAdd} className={`absolute top-6 right-6 p-3 rounded-xl transition-all shadow-xl active:scale-90 z-10 ${type === 'in' ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-red-600 text-white hover:bg-red-500'}`}>
        <Plus size={20} strokeWidth={4}/>
      </button>
      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3 italic font-sans">{label}</p>
      <p className={`text-3xl md:text-5xl font-bold tracking-tighter font-['Belleza',sans-serif] ${type === 'in' ? 'text-green-500' : 'text-red-600'}`}>
        Rp{amount.toLocaleString('id-ID')}
      </p>
      <div className={`absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all group-hover:scale-110 ${type === 'in' ? 'text-green-500' : 'text-red-600'}`}>
        {type === 'in' ? <TrendingUp size={160}/> : <TrendingDown size={160}/>}
      </div>
    </div>
  );
}

function NewTable({ title, type, data, onDelete, onViewProof }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
       <div className={`p-6 bg-zinc-900/20 border-b border-zinc-900 flex justify-between items-center`}>
          <h3 className={`text-[10px] font-bold uppercase flex items-center gap-2 tracking-[0.15em] font-['Poppins',sans-serif] ${type === 'income' ? 'text-green-500' : 'text-red-600'}`}>
            {type === 'income' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>} {title}
          </h3>
          <span className="text-[8px] font-black text-zinc-800 uppercase tracking-tighter">Database Log</span>
       </div>
       <div className="max-h-[450px] overflow-y-auto no-scrollbar font-sans px-4 py-4 space-y-2">
          {data.map((tx: any) => (
            <div key={tx.id} className="bg-zinc-900/20 border border-zinc-900/50 p-4 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                {tx.proof_url ? (
                  <button onClick={() => onViewProof(tx.proof_url)} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white border border-zinc-800 transition-colors">
                    <Eye size={16}/>
                  </button>
                ) : <div className="w-10 h-10 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-center text-zinc-800"><Receipt size={16}/></div>}
                <div>
                  <p className="text-[13px] font-bold text-zinc-200 tracking-tight leading-tight uppercase font-['Poppins',sans-serif] truncate max-w-[150px] md:max-w-none">{tx.profiles?.full_name || tx.description}</p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5">{tx.category} • {new Date(tx.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-sm font-bold tabular-nums ${type === 'income' ? 'text-green-500' : 'text-red-600'}`}>
                  {type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString('id-ID')}
                </p>
                <button onClick={() => onDelete(tx.id)} className="p-2 text-zinc-800 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="py-20 text-center opacity-20 text-[9px] font-bold uppercase tracking-widest">Belum ada transaksi</div>
          )}
       </div>
    </div>
  );
}

function ConfirmRow({ tx, onApprove, onDelete, onShowProof }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-5 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-red-600/30 transition-all shadow-sm">
      <div className="flex items-center gap-5">
        {tx.proof_url && (
          <button onClick={() => onShowProof(tx.proof_url)} className="w-12 h-12 bg-zinc-900 hover:bg-red-600 text-zinc-500 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg border border-zinc-800">
            <Eye size={20} />
          </button>
        )}
        <div>
          <p className="text-base md:text-xl font-bold uppercase tracking-tight text-white leading-tight mb-1 font-['Poppins',sans-serif]">{tx.profiles?.full_name}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {tx.category} • {new Date(tx.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-900 pt-4 md:pt-0">
        <p className="text-xl md:text-3xl font-bold text-red-600 font-['Belleza',sans-serif]">Rp{Number(tx.amount).toLocaleString('id-ID')}</p>
        <div className="flex gap-2">
          <button onClick={() => onApprove(tx.id, tx.user_id, tx.category)} className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90"><Check size={22} strokeWidth={3}/></button>
          <button onClick={() => onDelete(tx.id)} className="w-12 h-12 bg-zinc-900 text-zinc-600 hover:text-red-600 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-zinc-800"><X size={22} strokeWidth={3}/></button>
        </div>
      </div>
    </div>
  );
}