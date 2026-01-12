'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert("Akses Terbatas: Hanya Admin!");
        router.push('/dashboard');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAdmin();
  }, [router]);

  if (!isAuthorized) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="font-black italic text-red-600 animate-pulse tracking-tighter text-xl uppercase">
        Verifying Admin Access...
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-black">
      {/* PENTING: 
          - lg:pt-0: Di desktop tidak perlu padding tambahan karena sudah ada di RootLayout
          - pt-4: Memberi jarak di mobile agar tidak menempel ke header 
      */}
      <div className="max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}