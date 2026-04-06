import { createServiceRoleClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function NonSetupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const supabase = createServiceRoleClient()
    const { data: settings } = await supabase
        .from('Settings')
        .select('id')
        .limit(1)

    if(!settings || settings.length === 0) return redirect('/setup')
    return <div>{children}</div>
}
