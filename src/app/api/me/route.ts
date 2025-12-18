import { verifyJWT } from '@/lib/jwt'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const cookie = request.headers.get('cookie')
    if(!cookie) return NextResponse.json({ authenticated: false })
    
    const match = cookie.match(/auth=([^;]+)/)
    if(!match) return NextResponse.json({ authenticated: false })

    try {
        const payload = verifyJWT(match[1])
        return NextResponse.json({ authenticated: true, user: { id: payload.sub, role: payload.role } })
    } catch {
        return NextResponse.json({ authenticated: false })
    }
}
