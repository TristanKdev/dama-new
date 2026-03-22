import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AdminSidebar } from './components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-dama-cream p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
