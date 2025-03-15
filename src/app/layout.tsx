import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Provider } from "./providers"
import "./globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "CTFed",
    description: "A simple CTF creating and hosting platform made using NextJS.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Provider>
                <div className="my-6 px-3 flex flex-col min-h-screen">
                    <div className="flex-grow">{children}</div>
                </div>
            </Provider>
        </body>
    </html>
}
