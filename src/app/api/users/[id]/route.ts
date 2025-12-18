import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = parseInt(params.id)
        if(isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })

        const user = await prisma.user.findUnique({
            where: { id: userId, active: true, hidden: false },
            select: { id: true, username: true, score: true, role: true, createdAt: true, active: true, hidden: true, teamMember: {
                select: { team: { select: { id: true, name: true, score: true } } }
            } }
        })

        if(!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        return NextResponse.json({
            id: user.id,
            username: user.username,
            score: user.score,
            role: user.role,
            createdAt: user.createdAt,
            active: user.active,
            hidden: user.hidden,
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
