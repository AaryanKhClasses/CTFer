import { NextResponse } from 'next/server'
import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json()
        if(!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        const user = await prisma.user.findUnique({ where: { username } })
        if(!user || !user.active) return NextResponse.json({ error: 'User Not Found or Inactive' }, { status: 401 })

        const valid = await bcrypt.compare(password, user.password)
        if(!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        
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
