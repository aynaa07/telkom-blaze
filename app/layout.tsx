'use client';

import "./globals.css";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Alice, Belleza, Poppins } from 'next/font/google';
import { 
  LayoutDashboard, Bell, Swords, QrCode, Wallet, 
  ImageIcon, Newspaper, Crown, User, Settings, 
  LogOut, Menu, X, ChevronRight, ClipboardList, 
  Target, Users, FileText, CalendarDays
} from 'lucide-react';
import Link from 'next/link';

// --- 1. PEMANGGILAN FONT HARUS DI LUAR KOMPONEN ---
const aliceFont = Alice({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap' 
});

const bellezzaFont = Belleza({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap' 
});

const poppinsFont = Poppins({ 
  weight: ['400', '600'], 
  subsets: ['latin'],
  display: 'swap' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<{name: string, nim: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const noSidebar = pathname === '/' || pathname === '/login' || pathname === '/register';

  const profileRoute = role === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const notifRoute = role === 'admin' ? '/admin/notifications' : '/dashboard/notifications';

  const adminMenu = [
    { 
      group: "NAVIGASI UTAMA", 
      items: [
        { href: "/admin", icon: <LayoutDashboard size={18}/>, label: "Dashboard" }, 
        { href: "/admin/attendance", icon: <ClipboardList size={18}/>, label: "Absensi" }
      ] 
    },
    { 
      group: "OPERASIONAL", 
      items: [
        { href: "/admin/tournament", icon: <Swords size={18}/>, label: "Pertandingan" }, 
        { href: "/admin/training", icon: <Target size={18}/>, label: "Latihan" }, 
        { href: "/admin/news", icon: <Newspaper size={18}/>, label: "Update Berita" }
      ] 
    },
    { 
      group: "ASSET & KEUANGAN", 
      items: [
        { href: "/admin/treasury", icon: <Wallet size={18}/>, label: "Bendahara" }, 
        { href: "/admin/gallery", icon: <ImageIcon size={18}/>, label: "Galeri Foto" },
      ] 
    },
    { 
      group: "SQUAD SYSTEM", 
      items: [
        { href: "/admin/players", icon: <Users size={18}/>, label: "Data Pemain" }, 
        { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Pemain Terbaik" },
        { href: "/admin/documents", icon: <FileText size={18}/>, label: "Dokumentasi" }
      ] 
    }
  ];

  const userMenu = [
    { 
      group: "MENU UTAMA", 
      items: [
        { href: "/dashboard", icon: <LayoutDashboard size={18}/>, label: "Overview" }, 
        { href: "/dashboard/match-intel", icon: <Swords size={18}/>, label: "Info Tanding" }, 
        // --- TAMBAHAN MENU LATIHAN UNTUK PLAYER ---
        { href: "/dashboard/training", icon: <CalendarDays size={18}/>, label: "Jadwal Latihan" }, 
        { href: "/player/scan", icon: <QrCode size={18}/>, label: "Scan Absen" }, 
        { href: "/dashboard/treasury", icon: <Wallet size={18}/>, label: "Kas Saya" },
      ] 
    },
    { 
      group: "INFORMASI TIM", 
      items: [
        { href: "/dashboard/gallery", icon: <ImageIcon size={18}/>, label: "Galeri" }, 
        { href: "/dashboard/news", icon: <Newspaper size={18}/>, label: "Berita" }, 
        { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Top Player" },
        { href: "/dashboard/documents", icon: <FileText size={18}/>, label: "Dokumentasi" }
      ] 
    }
  ];

  const checkUserRole = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (!noSidebar) router.push('/login');
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role, full_name, nim').eq('id', user.id).single();
    if (profile) {
      setRole(profile.role || 'user');
      setUserData({ name: profile.full_name || 'Member', nim: profile.nim || '' });
    }
    setLoading(false);
  }, [noSidebar, router]);

  useEffect(() => { checkUserRole(); }, [checkUserRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const currentMenu = role === 'admin' ? adminMenu : userMenu;

  return (
    <html lang="en">
      <body className={`${bellezzaFont.className} bg-black text-white antialiased min-h-screen overflow-hidden`}>
        
        {loading && !noSidebar ? (
          <div className="flex items-center justify-center min-h-screen w-full bg-black">
            <p className="text-red-600 font-bold uppercase tracking-[0.5em] animate-pulse text-xs font-sans">Loading System...</p>
          </div>
        ) : noSidebar ? (
          <div className="h-screen overflow-y-auto">{children}</div>
        ) : (
          <div className="flex h-screen overflow-hidden">
            
            {/* SIDEBAR DESKTOP */}
            <aside className="w-64 border-r border-zinc-900 bg-black flex flex-col hidden lg:flex z-[120] shrink-0 font-sans">
              <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-4 mb-10 px-2">
                  <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-xl shadow-red-600/10">
                    <img src="/logo-ukm.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-lg font-bold uppercase tracking-tight text-white leading-none">TELKOM <span className="text-red-600">BLAZE</span></div>
                </div>
                <nav className="space-y-8">
                  {currentMenu.map((group, idx) => (
                    <div key={idx}>
                      <p className="px-4 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 font-sans"><span className="w-3 h-px bg-red-600/30"></span> {group.group}</p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="p-6 bg-black border-t border-zinc-900 font-sans">
                <button onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 hover:text-red-600 hover:border-red-600 transition-all font-bold uppercase text-[10px] tracking-widest font-sans">
                  <LogOut size={16} /> Keluar Sistem
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden font-sans">
              <header className="border-b border-zinc-900 p-4 flex justify-between items-center bg-black h-[72px] shrink-0 font-sans">
                <div className="flex items-center gap-4 font-sans">
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="lg:hidden w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg active:scale-90 transition-transform"
                  >
                    <img src="/logo-ukm.png" alt="Menu" className="w-full h-full object-contain" />
                  </button>

                  <div className="hidden lg:flex items-center gap-3 px-2 font-sans">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-sans"><User size={16} className="text-zinc-500" /></div>
                    <div className="min-w-0 font-sans">
                      <p className="text-[11px] font-bold uppercase text-white leading-none truncate font-sans">{userData?.name}</p>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1 font-sans">{role === 'admin' ? 'ADMIN PANEL' : `ID: ${userData?.nim}`}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-sans">
                  <Link href={profileRoute} className={`p-2.5 rounded-xl border transition-all font-sans ${pathname === profileRoute ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                    <Settings size={20} />
                  </Link>
                  <Link href={notifRoute} className={`relative p-2.5 rounded-xl border transition-all font-sans ${pathname === notifRoute ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-black animate-pulse font-sans"></span>
                  </Link>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-10 bg-black font-sans">
                <div className="max-w-6xl mx-auto font-sans">{children}</div>
              </main>
            </div>
          </div>
        )}

        {/* MOBILE DRAWER */}
        <div className={`fixed inset-y-0 left-0 z-[150] w-[280px] bg-black border-r border-zinc-900 transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-8 font-sans">
            <div className="flex justify-between items-center mb-10 font-sans">
              <div className="flex items-center gap-3 font-sans">
                <div className="bg-white p-2 rounded-xl shadow-lg font-sans">
                  <img src="/logo-ukm.png" className="w-6 h-6 object-contain font-sans" alt="Logo" />
                </div>
                <div className="text-sm font-bold uppercase tracking-tight text-white leading-none font-sans">TELKOM <span className="text-red-600 font-sans">BLAZE</span></div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 bg-zinc-900 p-2 rounded-lg hover:text-white font-sans"><X size={20} /></button>
            </div>
            <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar font-sans">
              {currentMenu.map((group, idx) => (
                <div key={idx} className="space-y-3 font-sans">
                  <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest ml-2 flex items-center gap-2 font-sans">
                    <span className="w-2 h-px bg-red-600/30 font-sans"></span> {group.group}
                  </p>
                  {group.items.map((item) => (
                    <MobileNavLink key={item.href} {...item} active={pathname === item.href} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[140] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all group font-sans ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 font-sans' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50 font-sans'}`}>
      <span className={active ? 'text-white font-sans' : 'group-hover:text-red-600 transition-colors font-sans'}>{icon}</span>
      <span className={`text-[11px] font-bold uppercase tracking-widest leading-none ${poppinsFont.className}`}>{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all font-sans ${active ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20 font-sans' : 'bg-zinc-950 border-zinc-900 text-zinc-500 font-sans'}`}>
      <span className={active ? 'text-white font-sans' : 'text-red-600 font-sans'}>{icon}</span>
      <span className={`text-[11px] font-bold uppercase tracking-widest flex-1 leading-none ${poppinsFont.className}`}>{label}</span>
      <ChevronRight size={14} className={active ? 'opacity-100 font-sans' : 'opacity-20 font-sans'} />
    </Link>
  );
}