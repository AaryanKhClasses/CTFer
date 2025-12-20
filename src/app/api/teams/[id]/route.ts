import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const teamId = parseInt(id)
        if(isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })

        const team = await prisma.team.findUnique({
            where: { id: teamId, hidden: false },
            select: { id: true, name: true, score: true, createdAt: true, hidden: true }
        })

        if(!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

        return NextResponse.json({
            id: team.id,
            name: team.name,
            score: team.score,
            createdAt: team.createdAt,
            hidden: team.hidden,
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const teamId = parseInt(id)
        if(isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
        const team = await prisma.team.findUnique({ where: { id: teamId } })
        if(!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

        const updatedTeam = await prisma.team.update({
            where: { id: teamId },
            data: { hidden: !team.hidden }
        })
        if(!updatedTeam) return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
        return NextResponse.json({
            id: updatedTeam.id,
            name: updatedTeam.name,
            score: updatedTeam.score,
            createdAt: updatedTeam.createdAt,
            hidden: updatedTeam.hidden,
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
