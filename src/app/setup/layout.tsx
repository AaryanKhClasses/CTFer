export default async function SetupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang='en' className='dark'>
        <body>{children}</body>
    </html>
}
