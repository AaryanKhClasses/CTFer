import prisma from '@/lib/db'
import { signJWT } from '@/lib/jwt'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { email, username, password } = await req.json()
        if(!email || !username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        if(password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })

        const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
        if(existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
            }
        })
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
