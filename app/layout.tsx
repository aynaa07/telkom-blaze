'use client';

import "./globals.css";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Bell, Swords, QrCode, Wallet, 
  ImageIcon, Newspaper, Crown, User, Settings, 
  LogOut, Menu, X, ChevronRight, ClipboardList, 
  Target, Users
} from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<{name: string, nim: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const noSidebar = pathname === '/' || pathname === '/login' || pathname === '/register';

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
      setUserData({ name: profile.full_name || 'Squad Member', nim: profile.nim || 'No Identity' });
    }
    setLoading(false);
  }, [noSidebar, router]);

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const adminMenu = [
    { group: "COMMAND CENTER", items: [{ href: "/admin", icon: <LayoutDashboard size={18}/>, label: "Command Center" }, { href: "/admin/attendance", icon: <ClipboardList size={18}/>, label: "Attendance Logs" }] },
    { group: "FIELD OPERATIONS", items: [{ href: "/admin/tournament", icon: <Swords size={18}/>, label: "Matches & Results" }, { href: "/admin/training", icon: <Target size={18}/>, label: "Squad Training" }] },
    { group: "FINANCIAL & ASSETS", items: [{ href: "/admin/treasury", icon: <Wallet size={18}/>, label: "Treasury Command" }, { href: "/admin/gallery", icon: <ImageIcon size={18}/>, label: "Media Gallery" }] },
    { group: "SQUAD SYSTEM", items: [{ href: "/admin/players", icon: <Users size={18}/>, label: "Manage Players" }, { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Best Blazers" }] }
  ];

  const userMenu = [
    { group: "OPERATIONS", items: [{ href: "/dashboard", icon: <LayoutDashboard size={18}/>, label: "Overview" }, { href: "/dashboard/match-intel", icon: <Swords size={18}/>, label: "Match Intel" }, { href: "/player/scan", icon: <QrCode size={18}/>, label: "Scan Attendance" }, { href: "/dashboard/treasury", icon: <Wallet size={18}/>, label: "My Treasury" }] },
    { group: "TEAM ARCHIVE", items: [{ href: "/dashboard/gallery", icon: <ImageIcon size={18}/>, label: "Team Gallery" }, { href: "/dashboard/news", icon: <Newspaper size={18}/>, label: "Team News" }, { href: "/dashboard/best-players", icon: <Crown size={18}/>, label: "Best Blazers" }] }
  ];

  const currentMenu = role === 'admin' ? adminMenu : userMenu;
  const profileRoute = role === 'admin' ? '/admin/profile' : '/dashboard/profile';

  return (
    <html lang="en" className="hide-scrollbar">
      <body className="bg-black text-white antialiased min-h-screen font-sans overflow-hidden">
        
        {loading && !noSidebar ? (
          <div className="flex items-center justify-center min-h-screen w-full bg-black">
            <p className="font-black text-red-600 italic tracking-tighter uppercase animate-pulse">Initializing System...</p>
          </div>
        ) : noSidebar ? (
          <div className="h-screen overflow-y-auto hide-scrollbar">{children}</div>
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* SIDEBAR DESKTOP */}
            <aside className="w-64 border-r border-zinc-900 bg-black flex flex-col hidden lg:flex z-[120] shrink-0">
              <div className="p-8 flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-4 mb-12 px-2">
                  <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-xl shadow-white/5"><img src="/logo-ukm.png" alt="Logo" className="w-full h-full object-contain" /></div>
                  <div className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">TELKOM<span className="text-red-600">BLAZE</span></div>
                </div>
                <nav className="space-y-8">
                  {currentMenu.map((group, idx) => (
                    <div key={idx}>
                      <p className="px-4 text-[7px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 italic">
                        <span className="w-4 h-[1px] bg-red-600"></span> {group.group}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="p-6 bg-black border-t border-zinc-900">
                <button onClick={handleLogout} className="w-full h-11 flex items-center justify-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-600 hover:border-red-600 transition-all font-black italic text-[10px] uppercase tracking-widest">
                  <LogOut size={16} /> Abort Mission
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden">
              <header className="border-b border-zinc-900 p-4 flex justify-between items-center bg-black h-[72px] shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-white rounded-lg"><img src="/logo-ukm.png" className="w-5 h-5 object-contain" alt="Logo" /></button>
                  <div className="hidden lg:flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center"><User size={14} className="text-zinc-500" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-white leading-none italic truncate">{userData?.name}</p>
                      <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest italic">{role === 'admin' ? 'ADMIN' : `ID: ${userData?.nim}`}</p>
                    </div>
                  </div>
                </div>

                {/* ICONS GROUP: SETTINGS & NOTIF */}
                <div className="flex items-center gap-2">
                  <Link href={profileRoute} className={`p-2.5 rounded-xl border transition-all ${pathname === profileRoute ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                    <Settings size={20} />
                  </Link>
                  <Link href="/dashboard/notifications" className={`relative p-2.5 rounded-xl border transition-all ${pathname === '/dashboard/notifications' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-black animate-pulse"></span>
                  </Link>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto hide-scrollbar p-4 lg:p-10 bg-black">
                <div className="max-w-5xl mx-auto">{children}</div>
              </main>
            </div>
          </div>
        )}

        {/* MOBILE DRAWER */}
        <div className={`fixed inset-y-0 left-0 z-[150] w-[280px] bg-black border-r border-zinc-900 transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-8 bg-black">
            <div className="flex justify-between items-center mb-10">
              <div className="bg-white p-2 rounded-xl"><img src="/logo-ukm.png" className="w-6 h-6 object-contain" alt="Logo" /></div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600"><X size={24} /></button>
            </div>
            <nav className="flex-1 space-y-8 overflow-y-auto hide-scrollbar">
              {currentMenu.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest ml-2 flex items-center gap-2 italic"><span className="w-2 h-[1px] bg-red-600"></span> {group.group}</p>
                  {group.items.map((item) => (
                    <MobileNavLink key={item.href} {...item} active={pathname === item.href} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[140] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-zinc-900 text-white shadow-lg shadow-white/5' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/40'}`}>
      <span className={active ? 'text-red-600' : 'group-hover:text-red-600'}>{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${active ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-zinc-900 text-zinc-500'}`}>
      <span className={active ? 'text-white' : 'text-red-600'}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest italic flex-1 leading-none">{label}</span>
      <ChevronRight size={14} className={active ? 'opacity-100' : 'opacity-20'} />
    </Link>
  );
}