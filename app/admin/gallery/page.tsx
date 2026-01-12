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
    if (!albumName || !albumCoverFile) return alert("Folder Name & Cover are mandatory!");
    setLoading(true);
    try {
      const fileName = `cover_${Math.random()}.${albumCoverFile.name.split('.').pop()}`;
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
      const fileName = `${Math.random()}.${photoFile.name.split('.').pop()}`;
      await supabase.storage.from('gallery').upload(fileName, photoFile);
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);

      await supabase.from('gallery').insert({
        title: photoTitle, album_id: selectedAlbum.id, image_url: urlData.publicUrl, category: 'Archive'
      });
      setPhotoTitle(''); setPhotoFile(null); setShowPhotoModal(false); fetchPhotos(selectedAlbum.id);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 mb-10 mt-2">
        <div className="flex items-center justify-between">
          <div>
            {selectedAlbum && (
              <button onClick={() => setSelectedAlbum(null)} className="flex items-center gap-1 text-red-600 mb-2 uppercase text-[9px] font-black italic tracking-widest">
                <ArrowLeft size={14}/> Back
              </button>
            )}
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              {selectedAlbum ? selectedAlbum.name : <>GALLERY <span className="text-red-600">OPS</span></>}
            </h1>
          </div>
          
          {/* Action Buttons */}
          {!selectedAlbum ? (
            <button onClick={() => setShowAlbumModal(true)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl active:bg-red-600 transition-all flex items-center justify-center">
              <FolderPlus size={20} className="text-red-600 hover:text-white"/>
            </button>
          ) : (
            <button onClick={() => setShowPhotoModal(true)} className="bg-red-600 p-3 rounded-xl active:scale-90 transition-all shadow-lg shadow-red-900/40 flex items-center justify-center">
              <Plus size={20} strokeWidth={4}/>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ALBUM LIST (2 Kolom di Mobile, 5 di Desktop) */}
      {!selectedAlbum ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <div key={album.id} onClick={() => setSelectedAlbum(album)} className="group space-y-3 active:scale-95 transition-transform">
              <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-[1.5rem] relative overflow-hidden flex items-center justify-center shadow-xl">
                {album.cover_url ? (
                  <img src={album.cover_url} className="w-full h-full object-cover opacity-60" alt={album.name} />
                ) : (
                  <Folder size={40} className="text-zinc-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete Folder?')) supabase.from('gallery_albums').delete().eq('id', album.id).then(fetchAlbums); }} className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg text-red-600"><Trash2 size={12}/></button>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <h3 className="text-[9px] font-black uppercase italic tracking-widest truncate">{album.name}</h3>
                </div>
              </div>
            </div>
          ))}
          {albums.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2rem] opacity-20 text-[10px] font-black uppercase italic">No Folders Found</div>
          )}
        </div>
      ) : (
        /* VIEW 2: PHOTO GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-500">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-[1.2rem] overflow-hidden border border-zinc-900 bg-zinc-950">
              <img src={photo.image_url} className="w-full h-full object-cover opacity-80" />
              <button onClick={() => { if(confirm('Erase photo?')) supabase.from('gallery').delete().eq('id', photo.id).then(() => fetchPhotos(selectedAlbum.id)); }} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white"><Trash2 size={12}/></button>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-20 text-[10px] font-black uppercase italic tracking-widest">Folder Empty</div>
          )}
        </div>
      )}

      {/* MODAL SYSTEM (Responsive Bottom-sheet) */}
      {(showAlbumModal || showPhotoModal) && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="bg-zinc-950 border-t md:border border-zinc-900 p-8 rounded-t-[2.5rem] md:rounded-[3rem] w-full max-w-md relative shadow-2xl">
             <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6 md:hidden"></div>
             <button onClick={() => {setShowAlbumModal(false); setShowPhotoModal(false)}} className="absolute top-6 right-6 text-zinc-500"><X/></button>
             
             {showAlbumModal ? (
               <>
                 <h3 className="text-xl font-black uppercase italic mb-6 tracking-tighter italic">Initialize <span className="text-red-600">Folder</span></h3>
                 <div className="space-y-4">
                    <input className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-red-600 italic" placeholder="FOLDER NAME..." value={albumName} onChange={e => setAlbumName(e.target.value.toUpperCase())} />
                    <label className="w-full h-32 bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-zinc-900 transition-all">
                       {albumCoverFile ? <p className="text-[8px] font-black text-green-500 text-center uppercase px-4">{albumCoverFile.name}</p> : <><ImageIcon className="text-zinc-700 mb-2"/><p className="text-[8px] font-black text-zinc-700 uppercase italic">Set Folder Cover</p></>}
                       <input type="file" className="hidden" accept="image/*" onChange={e => setAlbumCoverFile(e.target.files?.[0] || null)} />
                    </label>
                    <button onClick={handleCreateAlbum} disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl italic">
                       {loading ? <Loader2 className="animate-spin mx-auto" size={16}/> : "DEPLOY ARCHIVE"}
                    </button>
                 </div>
               </>
             ) : (
               <>
                 <h3 className="text-xl font-black uppercase italic mb-6 tracking-tighter italic">Add to <span className="text-red-600">{selectedAlbum.name}</span></h3>
                 <div className="space-y-4">
                    <input className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-red-600 italic" placeholder="PHOTO TITLE..." value={photoTitle} onChange={e => setPhotoTitle(e.target.value.toUpperCase())} />
                    <label className="w-full h-32 bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-zinc-900 transition-all">
                       {photoFile ? <p className="text-[8px] font-black text-green-500 text-center uppercase px-4">{photoFile.name}</p> : <p className="text-[8px] font-black text-zinc-700 uppercase italic">Select Intel File</p>}
                       <input type="file" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                    </label>
                    <button onClick={handleUploadPhoto} disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl italic">
                       {loading ? <Loader2 className="animate-spin mx-auto" size={16}/> : "UPLOAD TO FOLDER"}
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      )}
      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}