'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, MapPin, Clock, Trash2, Zap, Calendar, Loader2 } from 'lucide-react';

export default function AdminTraining() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    match_date: '', 
    venue: '', 
    match_type: 'Training', 
    status: 'Upcoming', 
    opponent_name: 'Internal Practice' 
  });

  useEffect(() => { fetchTrainings(); }, []);

  async function fetchTrainings() {
    setLoading(true);
    const { data } = await supabase
      .from('match_schedules')
      .select('*')
      .eq('match_type', 'Training')
      .order('match_date', { ascending: true });
    
    if (data) setTrainings(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.venue || !formData.match_date) return alert("Mohon lengkapi Lokasi dan Waktu!");
    setIsSubmitting(true);
    const { error } = await supabase.from('match_schedules').insert([formData]);
    if (!error) {
      setFormData({ ...formData, match_date: '', venue: '' });
      await fetchTrainings();
      alert("Jadwal latihan berhasil disimpan!");
    }
    setIsSubmitting(false);
  }

  async function deleteTraining(id: string) {
    if(confirm('Hapus sesi latihan ini?')) {
      await supabase.from('match_schedules').delete().eq('id', id);
      fetchTrainings();
    }
  }

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-['Poppins',sans-serif] animate-in fade-in duration-500">
      
      {/* HEADER - Menggunakan Poppins Semibold agar tidak terlalu kaku */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-none">
          Jadwal <span className="text-red-600">Latihan</span>
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-medium mt-3 font-sans">
          // Program Peningkatan Teknik Squad
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* FORM TAMBAH LATIHAN */}
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] space-y-6 sticky lg:top-24 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600/10 rounded-xl text-red-600 border border-red-600/20"><Calendar size={18} /></div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white">Tambah Jadwal</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest ml-1">Waktu & Jam</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all text-xs font-medium" 
                  value={formData.match_date} 
                  onChange={e => setFormData({...formData, match_date: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest ml-1">Lokasi Latihan</label>
                <input 
                  required 
                  placeholder="Masukkan lokasi..." 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all text-xs font-medium placeholder:text-zinc-800" 
                  value={formData.venue} 
                  onChange={e => setFormData({...formData, venue: e.target.value})} 
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting} 
              className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-semibold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:bg-zinc-800"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} fill="currentColor"/>}
              Simpan Sesi
            </button>
          </form>
        </div>

        {/* DAFTAR JADWAL */}
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-6 md:p-8 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-red-600" />
                  <p className="text-xs font-semibold text-white uppercase tracking-widest">Sesi Aktif</p>
                </div>
                <span className="text-[9px] font-semibold text-red-600 uppercase bg-red-600/5 px-3 py-1 rounded-full border border-red-600/10">
                  {trainings.length} Sesi
                </span>
            </div>

            <div className="divide-y divide-zinc-900">
              {trainings.length > 0 ? trainings.map(t => (
                <div key={t.id} className="p-6 md:p-8 flex items-center justify-between gap-4 group hover:bg-zinc-900/30 transition-all">
                  <div className="flex items-center gap-4 md:gap-6 w-full">
                    <div className="bg-zinc-900 p-4 rounded-2xl text-red-600 border border-zinc-800 group-hover:scale-110 transition-transform shrink-0">
                      <Calendar size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg text-white tracking-tight mb-1 truncate">
                        {new Date(t.match_date).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-zinc-500 uppercase">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-red-600"/> {new Date(t.match_date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-red-600"/> {t.venue}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTraining(t.id)} 
                      className="p-3 bg-zinc-900 text-zinc-700 hover:text-white hover:bg-red-600 rounded-xl transition-all active:scale-90"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                  <p className="text-zinc-800 font-medium uppercase text-[10px] tracking-widest">Belum ada jadwal latihan</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}