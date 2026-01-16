'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Folder, 
  ArrowLeft, 
  X, 
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function PlayerGallery() {
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => { fetchAlbums(); }, []);
  useEffect(() => { if (selectedAlbum) fetchPhotos(selectedAlbum.id); }, [selectedAlbum]);

  async function fetchAlbums() {
    setLoading(true);
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data);
    setLoading(false);
  }

  async function fetchPhotos(albumId: string) {
    const { data } = await supabase.from('gallery').select('*').eq('album_id', albumId).order('created_at', { ascending: false });
    if (data) setPhotos(data);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse font-sans italic">Membuka Arsip...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif] pb-24 selection:bg-red-600">
      
      {/* HEADER SECTION */}
      <div className="mb-10 mt-2">
        {selectedAlbum ? (
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 text-red-600 mb-6 uppercase text-[10px] font-bold italic tracking-widest font-sans active:scale-90 transition-transform"
          >
            <ArrowLeft size={16}/> Kembali ke Album
          </button>
        ) : null}
        
        <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-2 font-['Poppins',sans-serif]">
          {selectedAlbum ? selectedAlbum.name : <>BLAZE <span className="text-red-600 font-light">MEDIA</span></>}
        </h1>
        <p className="text-zinc-600 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] italic font-sans leading-none opacity-80">
          // {selectedAlbum ? 'Dokumentasi Tim' : 'Koleksi Foto Squad'}
        </p>
      </div>

      {/* VIEW 1: DAFTAR ALBUM (2 KOLOM DI HP) */}
      {!selectedAlbum ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 animate-in fade-in duration-500">
          {albums.map((album) => (
            <div 
              key={album.id} 
              onClick={() => setSelectedAlbum(album)}
              className="group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-[3/4] bg-zinc-950 border border-zinc-900 rounded-[2rem] relative overflow-hidden shadow-2xl">
                
                {album.cover_url ? (
                  <img 
                    src={album.cover_url} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                    alt={album.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
                    <Folder size={32} className="text-zinc-800" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                  <h3 className="text-xs md:text-xl font-bold uppercase italic leading-tight text-white mb-1 tracking-tight font-['Poppins',sans-serif]">
                    {album.name}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 font-sans">
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none font-sans italic">
                      {new Date(album.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                    <ChevronRight size={12} className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {albums.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem] opacity-20">
              <p className="text-[10px] font-bold uppercase tracking-widest italic font-sans">Belum ada album foto.</p>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: FOTO DI DALAM ALBUM (2 KOLOM MASONRY) */
        <div className="columns-2 lg:columns-4 gap-4 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              onClick={() => setSelectedImage(photo.image_url)}
              className="relative break-inside-avoid bg-zinc-950 rounded-[1.5rem] border border-zinc-900 overflow-hidden cursor-pointer shadow-xl active:scale-95 transition-transform"
            >
              <img 
                src={photo.image_url} 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity grayscale-0"
                alt={photo.title}
              />
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                 <p className="text-[8px] font-bold uppercase italic text-zinc-400 truncate font-sans tracking-widest">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 w-12 h-12 bg-zinc-900/80 rounded-2xl flex items-center justify-center text-white border border-zinc-800 active:scale-90 transition-transform">
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5" 
            alt="Preview"
          />
          
          <div className="absolute bottom-12 flex flex-col items-center gap-2 font-sans">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 italic animate-pulse">
               Ketuk dimana saja untuk menutup
             </p>
             <div className="w-12 h-1 bg-red-600 rounded-full" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .columns-2 { column-count: 2; }
        @media (min-width: 1024px) { .columns-lg-4 { column-count: 4; } }
      `}</style>
    </div>
  );
}