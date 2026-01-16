'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FolderPlus, Plus, X, Upload, Trash2, 
  ArrowLeft, Folder, Loader2, Image as ImageIcon 
} from 'lucide-react';

export default function AdminGalleryFolders() {
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const [albumName, setAlbumName] = useState('');
  const [albumCoverFile, setAlbumCoverFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => { fetchAlbums(); }, []);
  useEffect(() => { if (selectedAlbum) fetchPhotos(selectedAlbum.id); }, [selectedAlbum]);

  async function fetchAlbums() {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data);
  }

  async function fetchPhotos(albumId: string) {
    const { data } = await supabase.from('gallery').select('*').eq('album_id', albumId).order('created_at', { ascending: false });
    if (data) setPhotos(data);
  }

  async function handleCreateAlbum() {
    if (!albumName || !albumCoverFile) return alert("Nama Folder & Foto Sampul wajib diisi!");
    setLoading(true);
    try {
      const fileName = `cover_${Date.now()}.${albumCoverFile.name.split('.').pop()}`;
      await supabase.storage.from('gallery').upload(fileName, albumCoverFile);
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);

      await supabase.from('gallery_albums').insert({ name: albumName, cover_url: urlData.publicUrl });
      setAlbumName(''); setAlbumCoverFile(null); setShowAlbumModal(false); fetchAlbums();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleUploadPhoto() {
    if (!photoFile || !photoTitle || !selectedAlbum) return;
    setLoading(true);
    try {
      const fileName = `${Date.now()}.${photoFile.name.split('.').pop()}`;
      await supabase.storage.from('gallery').upload(fileName, photoFile);
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);

      await supabase.from('gallery').insert({
        title: photoTitle, album_id: selectedAlbum.id, image_url: urlData.publicUrl, category: 'Archive'
      });
      setPhotoTitle(''); setPhotoFile(null); setShowPhotoModal(false); fetchPhotos(selectedAlbum.id);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Belleza',sans-serif]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 mb-10 font-['Poppins',sans-serif]">
        <div className="flex items-center justify-between">
          <div>
            {selectedAlbum && (
              <button onClick={() => setSelectedAlbum(null)} className="flex items-center gap-2 text-red-600 mb-2 uppercase text-[10px] font-bold tracking-widest hover:text-white transition-colors">
                <ArrowLeft size={16}/> Kembali ke Galeri
              </button>
            )}
            <h1 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight leading-none">
              {selectedAlbum ? selectedAlbum.name : <>GALERI <span className="text-red-600">FOTO</span></>}
            </h1>
          </div>
          
          {/* Action Buttons */}
          {!selectedAlbum ? (
            <button onClick={() => setShowAlbumModal(true)} className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl hover:bg-red-600 transition-all shadow-xl group">
              <FolderPlus size={24} className="text-red-600 group-hover:text-white"/>
            </button>
          ) : (
            <button onClick={() => setShowPhotoModal(true)} className="bg-red-600 p-4 rounded-2xl active:scale-90 transition-all shadow-xl shadow-red-900/20">
              <Plus size={24} strokeWidth={3}/>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ALBUM LIST */}
      {!selectedAlbum ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {albums.map((album) => (
            <div key={album.id} onClick={() => setSelectedAlbum(album)} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all group-hover:border-red-600/50">
                {album.cover_url ? (
                  <img src={album.cover_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-500 group-hover:scale-110" alt={album.name} />
                ) : (
                  <Folder size={48} className="text-zinc-800" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('Hapus folder ini?')) supabase.from('gallery_albums').delete().eq('id', album.id).then(fetchAlbums); }} 
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-zinc-500 hover:text-red-600 transition-colors z-10"
                >
                  <Trash2 size={14}/>
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest truncate">{album.name}</h3>
                </div>
              </div>
            </div>
          ))}
          {albums.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
              <p className="text-xs font-bold uppercase tracking-widest">Belum ada folder galeri</p>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: PHOTO GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in duration-500">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden border border-zinc-900 bg-zinc-950 shadow-xl">
              <img src={photo.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              <button 
                onClick={() => { if(confirm('Hapus foto ini?')) supabase.from('gallery').delete().eq('id', photo.id).then(() => fetchPhotos(selectedAlbum.id)); }} 
                className="absolute top-3 right-3 p-2 bg-black/80 rounded-xl text-white hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full py-24 text-center opacity-20">
              <p className="text-xs font-bold uppercase tracking-widest">Folder ini masih kosong</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL SYSTEM */}
      {(showAlbumModal || showPhotoModal) && (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-8 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-md relative shadow-2xl">
             <button onClick={() => {setShowAlbumModal(false); setShowPhotoModal(false)}} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
               <X size={24}/>
             </button>
             
             {showAlbumModal ? (
               <div className="font-['Poppins',sans-serif]">
                 <h3 className="text-2xl font-semibold uppercase mb-8 tracking-tight">Buat <span className="text-red-600">Folder</span></h3>
                 <div className="space-y-5 font-sans">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Nama Folder</label>
                      <input className="w-full bg-black border border-zinc-900 p-4 rounded-2xl text-sm font-bold uppercase outline-none focus:border-red-600 transition-all" placeholder="MISAL: MAKESTA 2026" value={albumName} onChange={e => setAlbumName(e.target.value.toUpperCase())} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Foto Sampul</label>
                      <label className="w-full h-36 bg-black border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600/50 transition-all">
                         {albumCoverFile ? (
                           <p className="text-[10px] font-bold text-green-500 text-center uppercase px-6 line-clamp-2">{albumCoverFile.name}</p>
                         ) : (
                           <div className="flex flex-col items-center gap-2">
                             <ImageIcon size={32} className="text-zinc-800"/>
                             <p className="text-[10px] font-bold text-zinc-700 uppercase">Pilih Gambar Sampul</p>
                           </div>
                         )}
                         <input type="file" className="hidden" accept="image/*" onChange={e => setAlbumCoverFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>

                    <button onClick={handleCreateAlbum} disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all mt-4">
                       {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "SIMPAN FOLDER"}
                    </button>
                 </div>
               </div>
             ) : (
               <div className="font-['Poppins',sans-serif]">
                 <h3 className="text-2xl font-semibold uppercase mb-8 tracking-tight">Tambah ke <span className="text-red-600 truncate max-w-[150px] inline-block align-bottom">{selectedAlbum.name}</span></h3>
                 <div className="space-y-5 font-sans">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Judul Foto</label>
                      <input className="w-full bg-black border border-zinc-900 p-4 rounded-2xl text-sm font-bold uppercase outline-none focus:border-red-600 transition-all" placeholder="JUDUL FOTO..." value={photoTitle} onChange={e => setPhotoTitle(e.target.value.toUpperCase())} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Pilih File</label>
                      <label className="w-full h-36 bg-black border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600/50 transition-all">
                         {photoFile ? (
                           <p className="text-[10px] font-bold text-green-500 text-center uppercase px-6 line-clamp-2">{photoFile.name}</p>
                         ) : (
                           <div className="flex flex-col items-center gap-2">
                             <Upload size={32} className="text-zinc-800"/>
                             <p className="text-[10px] font-bold text-zinc-700 uppercase">Pilih Foto Galeri</p>
                           </div>
                         )}
                         <input type="file" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>

                    <button onClick={handleUploadPhoto} disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all mt-4">
                       {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "UPLOAD SEKARANG"}
                    </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Belleza&family=Poppins:wght@400;500;600&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}