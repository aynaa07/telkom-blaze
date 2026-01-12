'use client';

import Link from 'next/link';
import { 
  Instagram, 
  MessageCircle, 
  Video, 
  ArrowRight, 
  Shield, 
  Trophy, 
  Users, 
  Zap, 
  Image as ImageIcon
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-red-600 overflow-x-hidden relative">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] -z-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#d4141415,transparent_50%)] -z-10"></div>

      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center px-6 md:px-20 py-5 md:py-8 border-b border-zinc-900 bg-black/50 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
           <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] rotate-3">
              <img src="/logo-ukm.png" alt="Logo UKM" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
           </div>
           <div className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
             BLAZE<span className="text-red-600">OPS</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/login" className="text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors hidden sm:block">
            Member Login
          </Link>
          <Link href="/register" className="text-[10px] md:text-xs font-black bg-red-600 px-6 py-3 rounded-full uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-red-900/20 active:scale-95 italic">
            Join Squad
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="px-6 md:px-20 pt-20 md:pt-32 pb-16 text-left md:text-center relative max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full mb-8 md:mx-auto font-bold uppercase italic text-[9px] md:text-[10px] tracking-widest text-red-500">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
           </span>
           Live Operations 2026 // Global Access
        </div>

        <h1 className="text-[56px] md:text-[140px] font-black italic uppercase leading-[0.85] tracking-tighter mb-8 drop-shadow-2xl">
          UNLEASH <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">THE BEAST</span>
        </h1>
        
        <p className="text-zinc-500 text-sm md:text-xl mb-12 leading-relaxed max-w-sm md:max-w-2xl md:mx-auto italic font-medium">
          Command Center resmi UKM Futsal Telkom University Jakarta. <br className="hidden md:block" />
          Tempa fisik, kuasai taktik, dan bergabunglah dalam barisan tempur elit kami.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/register" className="group w-full md:w-64 flex items-center justify-between md:justify-center md:gap-4 bg-white text-black p-5 md:py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] italic transition-all hover:bg-red-600 hover:text-white shadow-xl">
             Get Started
             <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18}/>
          </Link>
          <Link href="/dashboard/gallery" className="w-full md:w-64 flex items-center justify-between md:justify-center md:gap-4 bg-zinc-900/50 border border-zinc-800 p-5 md:py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] italic text-zinc-400 hover:border-red-600 hover:text-white transition-all group">
             Watch Intel
             <ImageIcon className="group-hover:text-red-600 transition-colors" size={16}/>
          </Link>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="px-6 md:px-20 mb-24 max-w-7xl mx-auto">
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x">
          <StatCard icon={<Trophy size={24}/>} value="3+" label="Champion Titles" />
          <StatCard icon={<Users size={24}/>} value="50+" label="Active Personnel" />
          <StatCard icon={<Shield size={24}/>} value="ELITE" label="Squad Grade" />
        </div>
      </section>

      {/* --- MISSION GALLERY --- */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-red-600"></div>
              <span className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.4em] italic leading-none">Visual Records</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              MISSION <br/><span className="text-white/20">GALLERY</span>
            </h2>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-8 md:pb-0 scrollbar-hide snap-x">
          {/* Main Photo */}
          <div className="min-w-[300px] md:min-w-0 md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] border border-zinc-900 snap-center">
            <img src="/gallery/hero-squad.jpg" className="w-full h-[450px] md:h-[600px] object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" alt="Match" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-2 italic">Operation // Victory</p>
              <h3 className="text-2xl font-black uppercase italic leading-none">Champion Celebration</h3>
            </div>
          </div>

          <div className="min-w-[280px] md:min-w-0 relative group overflow-hidden rounded-[2.5rem] border border-zinc-900 snap-center">
            <img src="/gallery/training-1.jpg" className="w-full h-[450px] md:h-full object-cover opacity-40 group-hover:opacity-80 transition-all duration-500" alt="Training" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase italic italic">Training Drill</div>
          </div>

          <div className="min-w-[280px] md:min-w-0 relative group overflow-hidden rounded-[2.5rem] border border-zinc-900 snap-center">
            <img src="/gallery/tactical.jpg" className="w-full h-[450px] md:h-full object-cover opacity-40 group-hover:opacity-80 transition-all duration-500" alt="Tactical" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase italic italic">Tactical Meeting</div>
          </div>

          <div className="min-w-[280px] md:min-w-0 md:col-span-2 relative group overflow-hidden rounded-[2.5rem] border border-zinc-900 snap-center h-[250px] md:h-auto shadow-2xl">
            <img src="/gallery/trophy.jpg" className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-all duration-500" alt="Trophy" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-8 py-3 border border-white/10 rounded-full backdrop-blur-md group-hover:border-red-600 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Showcase Pride</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="pt-24 pb-12 px-6 md:px-20 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="text-3xl font-black italic uppercase tracking-tighter">
              Futsal<span className="text-red-600">TUKJ</span>
            </div>
            <div className="flex gap-4">
              <a href="https://instagram.com/futsaltukj" target="_blank" className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl">
                <Instagram size={20}/>
              </a>
              <a href="https://tiktok.com/@futsal.telujakarta" target="_blank" className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl">
                <Video size={20}/>
              </a>
              <a href="https://wa.me/6285545065007" target="_blank" className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl">
                <MessageCircle size={20}/>
              </a>
            </div>
          </div>
          
          <div className="text-left md:text-right space-y-2">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic leading-loose">
              Developed by BLAZE DEV TEAM // Version 2.0.26 <br />
              All strategic data is encrypted & secured.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENT ---
function StatCard({ icon, value, label }: { icon: any, value: string, label: string }) {
  return (
    <div className="min-w-[200px] flex-1 bg-zinc-900/40 border border-zinc-800/60 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md snap-center hover:border-red-600/40 transition-all group">
      <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform">{icon}</div>
      <h3 className="text-3xl md:text-5xl font-black italic uppercase leading-none mb-2 tracking-tighter">{value}</h3>
      <p className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">{label}</p>
    </div>
  );
}