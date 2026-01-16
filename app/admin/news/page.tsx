'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ImageIcon, Send, X, Loader2, Newspaper, 
  Info, Trash2, Calendar, Eye, Edit3, 
  LayoutGrid, PlusCircle, ArrowLeft, User
} from 'lucide-react';

export default function AdminNewsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Loading Terminal...</div>}>
      <AdminNewsContent />
    </Suspense>
  );
}

function AdminNewsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // FORM STATES
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // LIST & DETAIL STATES
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  // LOGIC PINDAH TAB OTOMATIS DARI DASHBOARD
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'manage') {
      setActiveTab('manage');
    } else {
      setActiveTab('create');
    }
  }, [searchParams]);

  const fetchNews = useCallback(async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setNewsList(data);
    setFetching(false);
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handlePublish = async () => {
    if (!title || !content || (!imageFile && !editId)) return alert("Lengkapi data!");
    setLoading(true);
    try {
      let publicUrl = preview;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('news_images').upload(`news-posts/${fileName}`, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('news_images').getPublicUrl(`news-posts/${fileName}`);
        publicUrl = urlData.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (editId) {
        await supabase.from('news').update({ title: title.toUpperCase(), content, image_url: publicUrl }).eq('id', editId);
      } else {
        await supabase.from('news').insert([{ title: title.toUpperCase(), content, image_url: publicUrl, author_id: user?.id }]);
      }

      alert("Success!");
      resetForm();
      fetchNews();
      setActiveTab('manage');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setImageFile(null); setPreview(null); setEditId(null);
  };

  const handleEdit = (news: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(news.title);
    setContent(news.content);
    setPreview(news.image_url);
    setEditId(news.id);
    setActiveTab('create');
  };

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="font-['Poppins',sans-serif]">
          <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight text-white leading-none">
            NEWS <span className="text-red-600 font-light italic">CENTER</span>
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em] mt-3 font-sans opacity-70">// Editorial & Feed Management</p>
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 w-full md:w-auto shadow-2xl">
          <button 
            onClick={() => {setActiveTab('create'); resetForm();}}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <PlusCircle size={16} /> {editId ? 'Edit News' : 'Create News'}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid size={16} /> Kelola Feed
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* --- VIEW: CREATE/EDIT --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider ml-1">Headline Utama</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-sm font-semibold text-white focus:border-red-600 outline-none transition-all uppercase" placeholder="Masukkan judul..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider ml-1">Isi Berita</label>
              <textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-sm leading-relaxed text-zinc-300 focus:border-red-600 outline-none transition-all resize-none font-['Belleza']" placeholder="Tuliskan isi berita..."></textarea>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider ml-1">Thumbnail Media</label>
                <div className={`relative border-2 border-dashed rounded-[2.5rem] aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden transition-all ${preview ? 'border-red-600/50' : 'border-zinc-900 hover:border-zinc-800'}`}>
                  {preview ? (
                    <><img src={preview} className="w-full h-full object-cover" /><button onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-4 right-4 bg-black/80 p-2.5 rounded-full hover:bg-red-600 transition-colors"><X size={16}/></button></>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center p-10 text-center group">
                      <div className="p-4 bg-zinc-900 rounded-2xl mb-4 group-hover:bg-red-600 transition-all"><ImageIcon size={32} className="text-zinc-500 group-hover:text-white" /></div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Upload Media</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} />
                    </label>
                  )}
                </div>
             </div>
             <button onClick={handlePublish} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl">
               {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> {editId ? 'Simpan Update' : 'Publish Sekarang'}</>}
             </button>
          </div>
        </div>
      ) : (
        /* --- VIEW: MANAGE FEED --- */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {fetching ? (
            <div className="flex justify-center py-32"><Loader2 className="animate-spin text-red-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((news) => (
                <div key={news.id} onClick={() => setSelectedNews(news)} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-red-600/30 transition-all cursor-pointer shadow-xl flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={news.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                       <Calendar size={12} className="text-red-600" />
                       <span className="text-[9px] font-bold uppercase text-white tracking-widest">{new Date(news.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}</span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-4 line-clamp-2 font-['Poppins',sans-serif]">{news.title}</h3>
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-900">
                      <button onClick={(e) => handleEdit(news, e)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        <Edit3 size={14} className="text-red-600" /> Edit News
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Hapus?')) supabase.from('news').delete().eq('id', news.id).then(fetchNews); }} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-700 hover:bg-red-600 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DETAIL VIEW --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 font-sans">
          <div className="bg-zinc-950 w-full h-full md:h-[90vh] md:max-w-4xl md:rounded-[3.5rem] overflow-hidden relative border border-zinc-900 flex flex-col shadow-2xl">
            <div className="p-5 flex justify-between items-center bg-black/80 border-b border-zinc-900 sticky top-0 z-30 backdrop-blur-xl">
              <button onClick={() => setSelectedNews(null)} className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] tracking-widest uppercase"><ArrowLeft size={18} /> Kembali</button>
              <button onClick={() => setSelectedNews(null)} className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
               <img src={selectedNews.image_url} className="w-full aspect-video object-cover" />
               <div className="p-8 md:p-16">
                  <h2 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight text-white mb-10 font-['Poppins',sans-serif]">{selectedNews.title}</h2>
                  <p className="text-zinc-400 text-base md:text-xl leading-[1.9] font-['Belleza'] whitespace-pre-wrap tracking-wide">{selectedNews.content}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;600;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}