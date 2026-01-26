import { verifyJWT } from '@/lib/jwt'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const cookie = request.headers.get('cookie')
    if(!cookie) return NextResponse.json({ authenticated: false })
    
    const match = cookie.match(/auth=([^;]+)/)
    if(!match) return NextResponse.json({ authenticated: false })

    try {
        const payload = verifyJWT(match[1])
        const userId = parseInt(payload.sub as string)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, username: true, teamMember: { select: { teamId: true, team: { select: { id: true, name: true } } } } }
        })

        if(!user) return NextResponse.json({ authenticated: false })

        return NextResponse.json({ 
            authenticated: true, 
            user: { 
                id: user.id, 
                role: user.role,
                username: user.username,
                team: user.teamMember ? user.teamMember.team : null 
            } 
        })
    } catch {
        return NextResponse.json({ authenticated: false })
    }
}
