import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const teams = await prisma.team.findMany({
            where: { },
            select: { id: true, name: true, score: true, createdAt: true, hidden: true, members: true },
        })
        return NextResponse.json(teams.map(team => ({
            id: team.id,
            name: team.name,
            score: team.score,
            createdAt: team.createdAt,
            hidden: team.hidden
        })))
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
