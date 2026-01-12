'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, Plus, X, Download, Trash2, 
  FileUp, Loader2, ShieldCheck, Lock, Search 
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
    if (!file || !form.title) return alert("Lengkapi data!");
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
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
      alert("Document Deployed!");
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 mt-2">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter italic">TACTICAL <span className="text-red-600">ARCHIVE</span></h1>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic mt-1 leading-none">// Intelligence & Records Management</p>
        </div>
        <button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-red-600 hover:bg-white text-white hover:text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-900/20">
          <Plus size={18} strokeWidth={3}/> Upload New Intel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className={`absolute top-0 right-0 p-4 text-[10px] font-black uppercase italic tracking-widest ${doc.access_level === 'admin' ? 'text-red-600' : 'text-green-600'}`}>
               {doc.access_level}
            </div>
            
            <div className="p-4 bg-zinc-900 rounded-2xl text-red-600 w-fit mb-6">
              <FileText size={28}/>
            </div>
            
            <h3 className="text-sm font-black uppercase italic text-white mb-1 truncate">{doc.title}</h3>
            <p className="text-[8px] text-zinc-600 font-black uppercase italic mb-8">{doc.category} // .{doc.file_type}</p>
            
            <div className="flex gap-2">
              <a href={doc.file_url} target="_blank" className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white py-4 rounded-xl flex items-center justify-center transition-all font-black text-[10px] italic">
                <Download size={16} className="mr-2"/> DOWNLOAD
              </a>
              <button onClick={() => { if(confirm('Erase this intel?')) supabase.from('document_archives').delete().eq('id', doc.id).then(fetchDocs); }} className="px-5 bg-zinc-900 hover:bg-red-600 text-zinc-700 hover:text-white rounded-xl transition-all">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL UPLOAD ADMIN */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-10 rounded-t-[3rem] md:rounded-[3.5rem] w-full max-w-md relative shadow-2xl">
             <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X/></button>
             <h3 className="text-2xl font-black uppercase italic mb-8 tracking-tighter leading-none italic">UPLOAD <span className="text-red-600">INTEL</span></h3>
             <div className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-600 uppercase italic ml-2">File Title</label>
                   <input className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-red-600 italic text-white" placeholder="E.G. DISPEN REKTOR CUP" value={form.title} onChange={e => setForm({...form, title: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-600 uppercase italic ml-2">Classification</label>
                   <select className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-[11px] font-black uppercase outline-none text-zinc-400" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-600 uppercase italic ml-2">Security Level</label>
                   <select className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-[11px] font-black uppercase outline-none text-zinc-400" value={form.access} onChange={e => setForm({...form, access: e.target.value})}>
                      <option value="player">PUBLIC (PLAYERS CAN VIEW)</option>
                      <option value="admin">RESTRICTED (ADMIN ONLY)</option>
                   </select>
                </div>
                <label className="w-full h-32 bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all">
                  {file ? <p className="text-[10px] font-black text-green-500 uppercase px-6 text-center">{file.name}</p> : <p className="text-[9px] font-black text-zinc-700 uppercase italic tracking-widest leading-none">Drop intelligence file here</p>}
                  <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                <button onClick={handleUpload} disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl italic transition-all hover:bg-red-600 hover:text-white">
                   {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : "DEPLOY TO ARCHIVE"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}