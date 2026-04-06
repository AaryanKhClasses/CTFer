import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function NonSetupAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return redirect('/')

    return <div>{children}</div>
}
