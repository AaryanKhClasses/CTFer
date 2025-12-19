import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

let cachedSettingsExists: boolean | null = null

export default async function NonSetupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    if(cachedSettingsExists === null) {
        const settings = await prisma.settings.findFirst({ select: { id: true } })
        cachedSettingsExists = !!settings
    }

    if(!cachedSettingsExists) return redirect('/setup') 
    return <html lang='en' className='dark'>
        <body>{children}</body>
    </html>
}
