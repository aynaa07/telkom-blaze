'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Download, 
  Loader2, 
  Search, 
  FileSearch, 
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function PlayerDocuments() {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_archives')
        .select('*')
        .eq('access_level', 'player')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocs(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={32} />
      <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Menyiapkan Berkas...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] pb-24 selection:bg-red-600">
      
      {/* HEADER SECTION */}
      <div className="mb-8 mt-2">
        <h1 className="text-4xl md:text-6xl font-normal uppercase tracking-tighter leading-none mb-2">
          ARSIP <span className="text-red-600 font-light">SQUAD</span>
        </h1>
        <p className="text-zinc-600 text-[10px] font-sans font-bold uppercase tracking-[0.2em] leading-none opacity-80">
          // Berkas penting & dokumen resmi tim
        </p>
      </div>

      {/* SEARCH BAR - HP Friendly & Sans-serif for Input */}
      <div className="relative mb-10 group font-sans">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={18} className="text-zinc-700 group-focus-within:text-red-600 transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Cari nama dokumen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:border-red-600 transition-all shadow-xl placeholder:text-zinc-800"
        />
      </div>

      {/* DOCUMENT GRID */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 animate-in fade-in duration-500">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="group bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] relative overflow-hidden transition-all hover:border-red-600/40 shadow-2xl">
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-lg border border-zinc-800 font-sans">
                    <ShieldCheck size={10} className="text-green-500" />
                    <span className="text-[7px] font-black uppercase text-zinc-500 tracking-tighter">Verified</span>
                  </div>
                </div>

                <h3 className="font-normal uppercase text-lg md:text-xl italic leading-tight text-white mb-2 tracking-tight group-hover:text-red-600 transition-colors">
                  {doc.title}
                </h3>
                
                <div className="flex items-center gap-3 text-[9px] font-sans font-bold text-zinc-600 uppercase tracking-widest mb-10">
                  <Clock size={12} className="text-red-600" />
                  {new Date(doc.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-white hover:bg-red-600 text-black hover:text-white py-4 rounded-xl font-sans font-bold text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg"
                >
                  <Download size={14} /> BUKA BERKAS
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-[2.5rem] opacity-20 mx-4 font-sans">
          <FileSearch size={48} className="text-zinc-800 mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest italic text-center px-6">Dokumen tidak ditemukan.</p>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}