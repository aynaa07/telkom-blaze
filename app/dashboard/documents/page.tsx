'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Loader2, Search, FileSearch, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-white font-sans">
      <h1 className="text-4xl font-black italic uppercase mb-8">SHARED <span className="text-red-600">FILES</span></h1>
      
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem]">
              <FileText className="text-red-600 mb-4" size={32} />
              <h3 className="font-bold uppercase text-sm mb-4">{doc.title}</h3>
              <a href={doc.file_url} target="_blank" className="block w-full bg-white text-black text-center py-3 rounded-xl font-bold text-[10px]">DOWNLOAD</a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 italic text-sm">No documents found.</p>
      )}
    </div>
  );
}