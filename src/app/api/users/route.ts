import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { active: true, hidden: false },
            select: { id: true, username: true, score: true, role: true, createdAt: true, active: true, hidden: true, teamMember: {
                select: { team: { select: { id: true, name: true, score: true } } }
            } },
            orderBy: { id: 'asc' },
        })
        return NextResponse.json(users.map(user => ({
            id: user.id,
            username: user.username,
            score: user.score,
            role: user.role,
            createdAt: user.createdAt,
            active: user.active,
            hidden: user.hidden,
        })))
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
