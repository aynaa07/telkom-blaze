'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Check, X, Loader2, Wallet, Users, Receipt, 
  Search, CreditCard, TrendingUp, TrendingDown, 
  Plus, Trash2
} from 'lucide-react';

export default function AdminTreasury() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cashflow' | 'confirm' | 'checklist'>('cashflow');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, balance: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState<{show: boolean, type: 'income' | 'expense' | null}>({ show: false, type: null });
  const [manualForm, setManualForm] = useState({ amount: '', desc: '', cat: 'Sewa Lapangan' });

  const weeks = [1, 2, 3, 4];

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [txRes, pRes, wRes] = await Promise.all([
        supabase.from('treasury_transactions').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, role').order('full_name'),
        supabase.from('weekly_dues').select('*')
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
        await supabase.from('weekly_dues').upsert({
          user_id: userId,
          week_number: weekNum,
          year: new Date().getFullYear(),
          is_paid: true,
          transaction_id: id
        });
      }
      fetchData();
    }
  }

  async function addManualTransaction() {
    if (!manualForm.amount || !manualForm.desc) return alert("Isi data lengkap!");
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
    if(!confirm("Hapus catatan ini?")) return;
    await supabase.from('treasury_transactions').delete().eq('id', id);
    fetchData();
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <p className="text-[10px] font-black italic uppercase tracking-[0.4em] text-zinc-700 animate-pulse">Initializing Treasury Command...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">TREASURY <span className="text-red-600">COMMAND</span></h1>
          <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-3 leading-none">// Operational Capital Oversight</p>
        </div>
        
        {/* TAB NAVIGATION - Mobile Swipeable */}
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 overflow-x-auto scrollbar-hide max-w-full w-full xl:w-auto">
          <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} label="Cashflow" icon={<Receipt size={14}/>} />
          <TabButton active={activeTab === 'confirm'} onClick={() => setActiveTab('confirm')} label="Confirm" icon={<CreditCard size={14}/>} count={transactions.filter(t => t.status === 'pending').length} />
          <TabButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} label="Checklist" icon={<Users size={14}/>} />
        </div>
      </div>

      {/* --- SECTION 1: CASHFLOW --- */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="relative group">
              <StatCard label="Accumulated Income" amount={stats.total_in} type="in" />
              <button onClick={() => { setShowModal({show: true, type: 'income'}); setManualForm(prev => ({...prev, cat: 'Saldo Awal'})); }} className="absolute top-4 right-4 md:top-8 md:right-8 bg-green-600 hover:bg-white text-white hover:text-black p-3 md:p-4 rounded-xl transition-all shadow-xl active:scale-90">
                <Plus size={20} strokeWidth={4}/>
              </button>
            </div>
            <div className="relative group">
              <StatCard label="Capital Expense" amount={stats.total_out} type="out" />
              <button onClick={() => { setShowModal({show: true, type: 'expense'}); setManualForm(prev => ({...prev, cat: 'Sewa Lapangan'})); }} className="absolute top-4 right-4 md:top-8 md:right-8 bg-red-600 hover:bg-white text-white hover:text-black p-3 md:p-4 rounded-xl transition-all shadow-xl active:scale-90">
                <Plus size={20} strokeWidth={4}/>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {/* MUTASI IN */}
            <MutasiTable 
              title="Income Mutasi" 
              type="income" 
              data={transactions.filter(t => t.status === 'approved' && t.type === 'income')} 
              onDelete={deleteTx} 
            />
            {/* MUTASI OUT */}
            <MutasiTable 
              title="Expense Mutasi" 
              type="expense" 
              data={transactions.filter(t => t.status === 'approved' && t.type === 'expense')} 
              onDelete={deleteTx} 
            />
          </div>
        </div>
      )}

      {/* --- SECTION 2: CONFIRM --- */}
      {activeTab === 'confirm' && (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-4xl mx-auto">
          {transactions.filter(t => t.status === 'pending').map((tx) => (
            <div key={tx.id} className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-red-600/50 transition-all">
              <div>
                <p className="text-lg md:text-xl font-black italic uppercase text-white leading-none mb-2">{tx.profiles?.full_name}</p>
                <p className="text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase italic tracking-widest leading-none">{tx.category} // {new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-900 pt-4 md:pt-0">
                <p className="text-2xl md:text-3xl font-black italic tracking-tighter text-red-600">Rp{Number(tx.amount).toLocaleString('id-ID')}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(tx.id, tx.user_id, tx.category)} className="w-12 h-12 md:w-14 md:h-14 bg-green-600 hover:bg-white text-white hover:text-black rounded-2xl flex items-center justify-center transition-all active:scale-90">
                    <Check size={24} strokeWidth={4}/>
                  </button>
                  <button onClick={() => deleteTx(tx.id)} className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 text-zinc-600 hover:text-red-600 rounded-2xl flex items-center justify-center transition-all active:scale-90">
                    <X size={24} strokeWidth={4}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {transactions.filter(t => t.status === 'pending').length === 0 && (
            <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
              <p className="text-[10px] font-black italic uppercase tracking-[0.5em]">No Intelligence Found</p>
            </div>
          )}
        </div>
      )}

      {/* --- SECTION 3: CHECKLIST --- */}
      {activeTab === 'checklist' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-900 gap-4">
             <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">SQUAD <span className="text-red-600 underline decoration-red-600/30 underline-offset-8">DUES</span></h3>
             <div className="relative w-full md:w-auto">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                <input className="bg-black border border-zinc-800 py-4 pl-12 pr-6 rounded-xl text-[10px] font-black uppercase w-full md:w-72 outline-none focus:border-red-600 italic tracking-widest placeholder:text-zinc-800 transition-all" placeholder="Filter Personnel..." onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[3rem] overflow-x-auto scrollbar-hide">
             <table className="w-full text-left min-w-[600px]">
                <thead>
                   <tr className="border-b border-zinc-900 bg-zinc-900/30 uppercase text-[8px] md:text-[9px] font-black italic text-zinc-600 tracking-[0.2em]">
                      <th className="px-8 py-6">Agent Identity</th>
                      {weeks.map(w => <th key={w} className="px-4 py-6 text-center italic">Week {w}</th>)}
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-bold uppercase text-[10px] md:text-[11px] tracking-widest italic">
                   {profiles.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((player) => (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="px-8 py-5 text-zinc-400 group-hover:text-red-600 transition-colors">{player.full_name}</td>
                         {weeks.map(w => {
                            const isPaid = weeklyData.some(d => d.user_id === player.id && d.week_number === w);
                            return (
                               <td key={w} className="px-4 py-5">
                                  <div className="flex justify-center">
                                     {isPaid ? (
                                        <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20"><Check size={16} strokeWidth={4}/></div>
                                     ) : (
                                        <div className="w-8 h-8 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-800 text-[7px] font-black">OFF</div>
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
      )}

      {/* --- MODAL (Mobile Ready) --- */}
      {showModal.show && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-8 md:p-12 rounded-t-[3rem] md:rounded-[3rem] max-w-md w-full relative overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
             <div className={`absolute top-0 left-0 w-full h-1.5 ${showModal.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}></div>
             <button onClick={() => setShowModal({show: false, type: null})} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
             
             <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter">MANUAL <span className={showModal.type === 'income' ? 'text-green-600' : 'text-red-600'}>{showModal.type}</span></h3>
             
             <div className="space-y-6">
                <div className="space-y-1.5 font-sans">
                   <label className="text-[8px] font-black text-zinc-600 uppercase ml-1 italic tracking-widest leading-none">Entry Description</label>
                   <input className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[11px] font-black uppercase italic outline-none focus:border-red-600 transition-all" placeholder="INPUT DETAILS..." value={manualForm.desc} onChange={e => setManualForm({...manualForm, desc: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-1.5 font-sans">
                   <label className="text-[8px] font-black text-zinc-600 uppercase ml-1 italic tracking-widest leading-none">Classification</label>
                   <select className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-[11px] font-black uppercase outline-none cursor-pointer focus:border-red-600" value={manualForm.cat} onChange={e => setManualForm({...manualForm, cat: e.target.value})}>
                      {showModal.type === 'income' ? (
                        <>
                          <option value="Saldo Awal">Saldo Awal</option>
                          <option value="Sponsor">Sponsor</option>
                          <option value="Lain-lain">Lain-lain</option>
                        </>
                      ) : (
                        <>
                          <option value="Sewa Lapangan">Sewa Lapangan</option>
                          <option value="Beli Alat/Bola">Beli Alat/Bola</option>
                          <option value="Tournament Fee">Tournament Fee</option>
                          <option value="Lain-lain">Lain-lain</option>
                        </>
                      )}
                   </select>
                </div>
                <div className="space-y-1.5 font-sans">
                   <label className="text-[8px] font-black text-zinc-600 uppercase ml-1 italic tracking-widest leading-none">Amount (IDR)</label>
                   <input type="number" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-2xl font-black italic outline-none focus:border-red-600 transition-all" placeholder="0" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} />
                </div>
                <button onClick={addManualTransaction} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl mt-6 active:scale-95 italic ${showModal.type === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                   Confirm {showModal.type} Records
                </button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}

// --- SUB COMPONENTS (Mobile Responsive) ---

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 md:px-8 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase italic transition-all relative shrink-0 ${active ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-700 hover:text-white'}`}>
      {icon} <span className="tracking-widest leading-none">{label}</span>
      {count !== undefined && count > 0 && <span className="absolute -top-1.5 -right-1 bg-white text-red-600 w-5 h-5 rounded-full text-[9px] flex items-center justify-center border-2 border-zinc-950 font-black italic">{count}</span>}
    </button>
  );
}

function StatCard({ label, amount, type }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden group min-h-[160px] md:min-h-[220px] flex flex-col justify-center">
      <div className={`absolute top-0 right-0 p-4 md:p-10 opacity-5 group-hover:opacity-10 transition-opacity ${type === 'in' ? 'text-green-500' : 'text-red-600'}`}>
        {type === 'in' ? <TrendingUp size={120}/> : <TrendingDown size={120}/>}
      </div>
      <p className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-2 md:mb-4 italic leading-none">{label}</p>
      <p className={`text-2xl md:text-5xl font-black italic tracking-tighter transition-all leading-tight ${type === 'in' ? 'text-green-500' : 'text-red-600'}`}>
        Rp{amount.toLocaleString('id-ID')}
      </p>
    </div>
  );
}

function MutasiTable({ title, type, data, onDelete }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden">
       <div className={`p-5 md:p-8 bg-zinc-900/20 border-b border-zinc-900 flex justify-between items-center italic`}>
          <h3 className={`text-[9px] md:text-[10px] font-black uppercase flex items-center gap-2 tracking-[0.2em] ${type === 'income' ? 'text-green-500' : 'text-red-600'}`}>
            {type === 'income' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>} {title}
          </h3>
          <span className="text-[8px] font-black text-zinc-800">RECORDS</span>
       </div>
       <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto scrollbar-hide">
          <table className="w-full text-[9px] md:text-[10px] font-black uppercase tracking-widest italic">
             <tbody className="divide-y divide-zinc-900/50">
                {data.map((tx: any) => (
                   <tr key={tx.id} className="hover:bg-white/[0.01] group transition-all">
                      <td className="px-6 py-4 md:px-8 md:py-6">
                         <p className="text-zinc-200 leading-tight mb-1 truncate max-w-[150px] md:max-w-none">{tx.profiles?.full_name || tx.description}</p>
                         <p className="text-[7px] md:text-[8px] text-zinc-700 leading-none">{tx.category} // {new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className={`px-4 py-4 md:px-8 md:py-6 text-right tabular-nums ${type === 'income' ? 'text-green-500' : 'text-red-600'}`}>
                        {type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="pr-4 md:pr-6 text-right w-10">
                        <button onClick={() => onDelete(tx.id)} className="opacity-0 group-hover:opacity-100 text-zinc-800 hover:text-red-600 transition-all">
                          <Trash2 size={14}/>
                        </button>
                      </td>
                   </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={3} className="p-10 text-center opacity-10 text-[8px]">No Records Found</td></tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}