'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, Plus, X, Download, Trash2, 
  FileUp, Loader2, ShieldCheck, Lock, Search, File
} from 'lucide-react';

export default function AdminDocuments() {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({ title: '', category: 'Sertifikat', access: 'player' });
  const [file, setFile] = useState<File | null>(null);

  const categories = ['Sertifikat', 'Surat Dispen', 'Info Pemain', 'Proposal', 'Berkas UKM', 'Berkas Pelatih'];

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const { data } = await supabase.from('document_archives').select('*').order('created_at', { ascending: false });
    if (data) setDocs(data);
  }

  async function handleUpload() {
    if (!file || !form.title) return alert("Mohon lengkapi judul dan pilih file!");
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage.from('documents').upload(fileName, file);
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('document_archives').insert({
        title: form.title,
        category: form.category,
        access_level: form.access,
        file_url: urlData.publicUrl,
        file_type: fileExt
      });

      if (dbError) throw dbError;

      setShowModal(false); setFile(null); setForm({ ...form, title: '' }); fetchDocs();
      alert("Dokumen berhasil disimpan!");
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  }

  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 font-['Poppins',sans-serif]">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight leading-none text-white">
            Arsip <span className="text-red-600">Dokumen</span>
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-3 font-sans font-bold">// Manajemen Berkas & Dokumen UKM</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto font-sans">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={16} />
            <input 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CARI DOKUMEN..." 
              className="w-full md:w-64 bg-zinc-950 border border-zinc-900 rounded-xl py-3.5 pl-12 pr-4 text-[11px] font-bold text-zinc-100 focus:border-red-600 outline-none transition-all placeholder:text-zinc-800 uppercase"
            />
          </div>
          <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold uppercase text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-900/10 tracking-widest">
            <Plus size={18} strokeWidth={3}/> Upload Dokumen
          </button>
        </div>
      </div>

      {/* DOCUMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/30 transition-all shadow-xl">
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${doc.access_level === 'admin' ? 'border-red-600/30 text-red-500 bg-red-600/5' : 'border-green-600/30 text-green-500 bg-green-600/5'}`}>
               {doc.access_level === 'admin' ? 'RESTRICTED' : 'PUBLIC'}
            </div>
            
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-red-600 mb-8 shadow-inner border border-zinc-800 group-hover:scale-110 transition-transform">
              <FileText size={28}/>
            </div>
            
            <div className="mb-8">
              <h3 className="text-base font-bold uppercase text-white mb-1 truncate font-['Poppins',sans-serif]">{doc.title}</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider font-sans">{doc.category} • {doc.file_type?.toUpperCase()}</p>
            </div>
            
            <div className="flex gap-2 font-sans">
              <a href={doc.file_url} target="_blank" className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white py-3.5 rounded-xl flex items-center justify-center transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg">
                <Download size={14} className="mr-2"/> View File
              </a>
              <button 
                onClick={() => { if(confirm('Hapus dokumen ini?')) supabase.from('document_archives').delete().eq('id', doc.id).then(fetchDocs); }} 
                className="px-4 bg-zinc-900 hover:bg-red-600 text-zinc-700 hover:text-white rounded-xl transition-all border border-zinc-800"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-30">
            <p className="text-xs font-bold uppercase tracking-widest italic">Belum ada dokumen yang diunggah</p>
          </div>
        )}
      </div>

      {/* MODAL UPLOAD */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-8 md:p-12 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-md relative shadow-2xl">
             <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
               <X size={24}/>
             </button>
             
             <h3 className="text-2xl font-semibold uppercase mb-10 tracking-tight font-['Poppins',sans-serif]">Upload <span className="text-red-600">Dokumen Baru</span></h3>
             
             <div className="space-y-6 font-sans">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase text-zinc-600 ml-1">Judul Berkas</label>
                   <input className="w-full bg-black border border-zinc-900 p-4 rounded-2xl text-sm font-semibold uppercase outline-none focus:border-red-600 transition-all text-white font-['Poppins',sans-serif]" placeholder="CONTOH: PROPOSAL KEGIATAN..." value={form.title} onChange={e => setForm({...form, title: e.target.value.toUpperCase()})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase text-zinc-600 ml-1">Kategori</label>
                     <select className="w-full bg-black border border-zinc-900 p-4 rounded-2xl text-[11px] font-bold uppercase outline-none text-zinc-400 cursor-pointer focus:border-red-600" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase text-zinc-600 ml-1">Hak Akses</label>
                     <select className="w-full bg-black border border-zinc-900 p-4 rounded-2xl text-[11px] font-bold uppercase outline-none text-zinc-400 cursor-pointer focus:border-red-600" value={form.access} onChange={e => setForm({...form, access: e.target.value})}>
                        <option value="player">PUBLIK</option>
                        <option value="admin">ADMIN SAJA</option>
                     </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-600 ml-1">Pilih Berkas</label>
                  <label className="w-full h-32 bg-black border-2 border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-red-600/50 transition-all group">
                    {file ? (
                      <p className="text-[10px] font-bold text-green-500 uppercase px-6 text-center line-clamp-2">{file.name}</p>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileUp size={24} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Pilih file PDF/Doc/Lainnya</p>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <button onClick={handleUpload} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4">
                   {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "SIMPAN DOKUMEN"}
                </button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}