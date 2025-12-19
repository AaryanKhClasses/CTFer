import { redirect } from 'next/navigation'

export default async function NonSetupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    fetch('/api/me', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
        if(data.user.role !== 'ADMIN') return redirect('/')
    })

    return <html lang='en' className='dark'>
        <body>{children}</body>
    </html>
}
