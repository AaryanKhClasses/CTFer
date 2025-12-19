import prisma from '@/lib/db'
import { signJWT } from '@/lib/jwt'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { name, description, adminUsername, adminEmail, adminPassword, teamSize, logoURL, startTime, endTime } = await req.json()
        if(!name || !adminUsername || !adminEmail || !adminPassword) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                username: adminUsername,
                password: hashedPassword,
                role: 'ADMIN',
                hidden: true
            }
        })
        const settings = await prisma.settings.create({
            data: {
                name,
                description,
                teamSize: teamSize || 1,
                logoURL: logoURL || '',
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null
            }
        })
        if(!user || !settings) return NextResponse.json({ error: 'Failed to create admin user or settings' }, { status: 500 })

        const token = signJWT({ sub: user.id.toString(), role: user.role, ver: user.authVersion })
        const res = NextResponse.json({ success: true })
        res.cookies.set('auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        })
        return res
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET() {
    const settings = await prisma.settings.findFirst({ select: { id: true } })
    if(settings) return NextResponse.json({ setup: true })
    else return NextResponse.json({ setup: false })
}
