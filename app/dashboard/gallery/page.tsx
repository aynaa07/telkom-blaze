'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Folder, 
  ArrowLeft, 
  Maximize2, 
  X, 
  Calendar,
  Clock,
  ChevronRight
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-8 mt-2">
        {selectedAlbum ? (
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-1 text-red-600 mb-4 uppercase text-[9px] font-black italic tracking-widest"
          >
            <ArrowLeft size={14}/> Back to Archives
          </button>
        ) : null}
        
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-1">
          {selectedAlbum ? selectedAlbum.name : <>BLAZE <span className="text-red-600">MEDIA</span></>}
        </h1>
        <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-[0.3em] italic">
          // {selectedAlbum ? 'Visual Intel Collected' : 'Squad Tactical Gallery'}
        </p>
      </div>

      {/* VIEW 1: ALBUM LIST (2 COLUMNS ON MOBILE) */}
      {!selectedAlbum ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {albums.map((album) => (
            <div 
              key={album.id} 
              onClick={() => setSelectedAlbum(album)}
              className="group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-[3/4] bg-zinc-950 border border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden transition-all duration-300">
                
                {album.cover_url ? (
                  <img 
                    src={album.cover_url} 
                    alt={album.name}
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Folder size={40} className="text-zinc-900" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end">
                  <h3 className="text-[10px] md:text-lg font-black uppercase italic leading-tight text-white mb-1 tracking-tighter truncate">
                    {album.name}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest italic leading-none">
                      {new Date(album.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                    <ChevronRight size={10} className="text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW 2: PHOTO GRID (2 COLUMNS ON MOBILE MASONRY) */
        <div className="columns-2 lg:columns-4 gap-3 md:gap-6 space-y-3 md:space-y-6 animate-in fade-in duration-500">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              onClick={() => setSelectedImage(photo.image_url)}
              className="relative break-inside-avoid bg-zinc-950 rounded-[1rem] md:rounded-[2rem] border border-zinc-900 overflow-hidden cursor-pointer"
            >
              <img 
                src={photo.image_url} 
                alt={photo.title} 
                className="w-full h-auto object-cover opacity-90 active:opacity-100"
              />
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                 <p className="text-[7px] font-black uppercase italic text-white/60 truncate">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL (PENGUATAN MOBILE) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[250] bg-black/98 flex items-center justify-center p-2 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md">
            <X size={20} />
          </button>
          
          <img 
            src={selectedImage} 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
            alt="Preview"
          />
          
          <p className="absolute bottom-10 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">
            Tap anywhere to close
          </p>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .columns-2 { column-count: 2; }
        @media (min-width: 1024px) { .columns-lg-4 { column-count: 4; } }
      `}</style>
    </div>
  );
}