import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function NonSetupAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value || ''
    if(!token) return redirect('/')

    try {
        const payload = verifyJWT(token)
        if(payload.role !== 'ADMIN') return redirect('/')
    } catch {
        return redirect('/')
    }

    return <div>{children}</div>
}
