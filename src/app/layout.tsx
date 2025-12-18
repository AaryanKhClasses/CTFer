import Sidebar from '@/components/Sidebar'
import localFont from 'next/font/local'
import { Providers } from './providers'
import type { Metadata } from 'next'
import './globals.css'

const poppins = localFont({
    src: '../../public/Poppins-Regular.ttf',
})

export const metadata: Metadata = {
    title: 'CTFer',
    description: 'A simple CTF platform.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang='en' className='dark'>
        <body className={`${poppins.className} antialiased min-h-screen flex flex-col`}>
            <Providers>
                <main className='flex-1 flex flex-row'>
                    <Sidebar />
                    <div className='flex-1 ml-20'>{children}</div>
                </main>
            </Providers>
        </body>
    </html>
}
