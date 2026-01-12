'use client';

import "./globals.css";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Newspaper, User, LogOut, X, 
  ChevronRight, Users, Settings, Crown, QrCode, 
  ClipboardList, Swords, Target, Shield, Wallet,
  Image as ImageIcon, FolderOpen
} from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<{name: string, nim: string} | null>(null);

  // 1. LOGIKA SEMBUNYIKAN SIDEBAR
  const isLandingPage = pathname === '/'; 
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const noSidebar = isLandingPage || isAuthPage;

  useEffect(() => {
    if (!noSidebar) checkUserRole();
  }, [pathname, noSidebar]);

  async function checkUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, nim')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setRole(profile.role || 'user');
        setUserData({
          name: profile.full_name || 'Squad Member',
          nim: profile.nim || 'No Identity'
        });
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- MENU CONFIG ---
  const adminMenu = [
    { group: "COMMAND CENTER", items: [{ href: "/admin", icon: <LayoutDashboard size={18}/>, label: "Command Center" }, { href: "/admin/attendance", icon: <ClipboardList size={18}/>, label: "Attendance Logs" }] },
    { group: "FIELD OPERATIONS", items: [{ href: "/admin/tournament", icon: <Swords size={18}/>, label: "Matches & Results" }, { href: "/admin/training", icon: <Target size={18}/>, label: "Squad Training" }] },
    { group: "FINANCIAL & DOCS", items: [{ href: "/admin/treasury", icon: <Wallet size={18}/>, label: "Treasury Command" }, { href: "/admin/documents", icon: <FolderOpen size={18}/>, label: "Tactical Archive" }] },
    { group: "MEDIA & ASSETS", items: [{ href: "/admin/gallery", icon: <ImageIcon size={18}/>, label: "Media Gallery" }, { href: "/admin/news", icon: <Newspaper size={18}/>, label: "Post News" }] },
    { group: "SQUAD SYSTEM", items: [{ href: "/admin/players", icon: <Users size={18}/>, label: "Manage Players" }, { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Best Blazers" }] }
  ];

  const userMenu = [
    { group: "OPERATIONS", items: [{ href: "/dashboard", icon: <LayoutDashboard size={18}/>, label: "Overview" }, { href: "/dashboard/match-intel", icon: <Swords size={18}/>, label: "Match Intel" }, { href: "/dashboard/training", icon: <Target size={18}/>, label: "Training Drills" }, { href: "/dashboard/treasury", icon: <Wallet size={18}/>, label: "My Treasury" }, { href: "/player/scan", icon: <QrCode size={18}/>, label: "Scan Attendance" }] },
    { group: "TEAM ARCHIVE", items: [{ href: "/dashboard/gallery", icon: <ImageIcon size={18}/>, label: "Team Gallery" }, { href: "/dashboard/documents", icon: <FolderOpen size={18}/>, label: "Shared Files" }, { href: "/dashboard/news", icon: <Newspaper size={18}/>, label: "Team News" }, { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Best Blazers" }] }
  ];

  const currentMenu = role === 'admin' ? adminMenu : userMenu;
  const profileRoute = role === 'admin' ? '/admin/profile' : '/dashboard/profile';

  // --- RENDER UNTUK LANDING/AUTH (TANPA SIDEBAR) ---
  if (noSidebar) {
    return (
      <html lang="en">
        <body className="bg-black text-white antialiased overflow-x-hidden">
          {children}
        </body>
      </html>
    );
  }

  // --- RENDER UNTUK DASHBOARD/ADMIN (DENGAN SIDEBAR) ---
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased flex overflow-x-hidden min-h-screen font-sans">
        
        {/* SIDEBAR DESKTOP */}
        <aside className="w-64 border-r border-zinc-900 bg-black flex flex-col sticky top-0 h-screen hidden lg:flex z-[120] shrink-0">
          <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
            
            {/* LOGO UKM HITAM DENGAN BOX PUTIH */}
            <div className="flex flex-col items-start gap-5 mb-12 px-2">
              <div className="bg-white p-2.5 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.1)] group transition-transform hover:scale-105">
                <img 
                  src="/logo-ukm.png" 
                  alt="UKM Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
                TELKOM<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">BLAZE</span>
              </div>
            </div>
            
            <nav className="space-y-8">
              {currentMenu.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="px-4 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 italic">
                    <span className="w-4 h-[1px] bg-red-600"></span> {group.group}
                  </p>
                  {group.items.map((item) => (
                    <SidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
                  ))}
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-zinc-900 bg-zinc-950/50 p-4 space-y-3">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <User size={18} className="text-zinc-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase text-white truncate leading-none mb-1 italic tracking-tighter">{userData?.name}</p>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate italic">{role === 'admin' ? 'Authorized Admin' : `ID: ${userData?.nim}`}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href={profileRoute} className={`h-11 flex items-center justify-center rounded-xl border transition-all ${pathname === profileRoute ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'}`}>
                <Settings size={18} />
              </Link>
              <button onClick={handleLogout} className="h-11 flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-600 hover:text-red-600 hover:border-red-600 transition-all"><LogOut size={18} /></button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen relative">
          {/* HEADER MOBILE */}
          <header className="lg:hidden border-b border-zinc-900 p-4 flex justify-between items-center bg-black sticky top-0 z-50">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded-lg active:scale-90 transition-transform shadow-lg shadow-white/5">
               <img src="/logo-ukm.png" className="w-6 h-6 object-contain" alt="Logo" />
            </button>
            <div className="text-sm font-black italic uppercase text-white tracking-tighter">TELKOM<span className="text-red-600">BLAZE</span></div>
            <Link href={profileRoute} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600"><User size={18} /></Link>
          </header>

          <main className="flex-1 bg-black overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>

        {/* MOBILE DRAWER */}
        <div className={`fixed inset-y-0 left-0 z-[150] w-[280px] bg-black border-r border-zinc-900 transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full bg-black p-8">
            <div className="flex justify-between items-center mb-10">
              <div className="bg-white p-2.5 rounded-xl shadow-lg shadow-white/5">
                 <img src="/logo-ukm.png" className="w-8 h-8 object-contain" alt="Logo" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600"><X size={24} /></button>
            </div>
            <nav className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
              {currentMenu.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest ml-2 flex items-center gap-2 italic">
                    <span className="w-2 h-[1px] bg-red-600"></span> {group.group}
                  </p>
                  {group.items.map((item) => (
                    <MobileNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[140] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
        
        <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-zinc-900 text-white border border-zinc-800 shadow-xl' : 'text-zinc-600 hover:text-white hover:bg-zinc-900/50'}`}>
      <span className={`${active ? 'text-red-600' : 'group-hover:text-red-600'}`}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.1em] italic leading-none">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${active ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}>
      <span className={active ? 'text-white' : 'text-red-600'}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest italic flex-1 leading-none">{label}</span>
      <ChevronRight size={14} className={active ? 'opacity-100' : 'opacity-20'} />
    </Link>
  );
}