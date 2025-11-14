import { Sidebar } from './sidebar'
import { Header } from './header'
import { createClient } from '@/lib/supabase/server'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

