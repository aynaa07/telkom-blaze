'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ImageIcon, Send, X, Loader2, Flame } from 'lucide-react';

export default function AdminNews() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = async () => {
    if (!title || !content || !imageFile) return alert("Lengkapi data berita!");
    
    setLoading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `news-posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news_images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news_images')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from('news')
        .insert([{
          title,
          content,
          image_url: publicUrl,
          author_id: user?.id
        }]);

      if (dbError) throw dbError;

      alert("Berita Berhasil di-Publish! 🔥");
      setTitle(''); setContent(''); setImageFile(null); setPreview(null);
      
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      {/* HEADER - UKURAN MANUSIAWI */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={14} className="text-red-600" />
          <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">News Management</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
          CREATE <span className="text-red-600">NEWS</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: FORM */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Headline</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 outline-none focus:border-red-600 transition-all text-sm font-bold placeholder:text-zinc-700"
              placeholder="Masukkan judul berita..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Content</label>
            <textarea 
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 outline-none focus:border-red-600 transition-all text-sm resize-none placeholder:text-zinc-700 leading-relaxed"
              placeholder="Tulis isi berita di sini..."
            ></textarea>
          </div>
        </div>

        {/* RIGHT: IMAGE & SUBMIT */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Thumbnail</label>
            <div className={`relative border border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden aspect-video bg-zinc-900/20 ${preview ? 'border-red-600/50' : 'border-zinc-800 hover:border-zinc-700'}`}>
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                  <button 
                    onClick={() => {setPreview(null); setImageFile(null);}}
                    className="absolute top-3 right-3 bg-black/60 p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center p-6 text-center group">
                  <ImageIcon size={32} className="text-zinc-700 group-hover:text-zinc-500 transition-colors mb-3" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 disabled:bg-zinc-800 shadow-lg shadow-red-900/10"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Publish News</>}
          </button>
        </div>
      </div>
    </div>
  );
}