import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
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

export async function POST(request: Request) {
    const cookie = request.headers.get('cookie')
    if(!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const match = cookie.match(/auth=([^;]+)/)
    if(!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const payload = verifyJWT(match[1])
        const userId = parseInt(payload.sub as string)
        const { action, teamName, teamPassword } = await request.json()

        const existingTeamMember = await prisma.teamMember.findUnique({ where: { userId } })
        if(existingTeamMember) return NextResponse.json({ error: 'User is already in a team' }, { status: 400 })

        if(action === 'create') {
            if(!teamName || teamName.trim().length === 0) return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
            if(!teamPassword || teamPassword.trim().length === 0) return NextResponse.json({ error: 'Team password is required' }, { status: 400 })
            const existingTeam = await prisma.team.findUnique({ where: { name: teamName } })
            if(existingTeam) return NextResponse.json({ error: 'Team name already exists' }, { status: 400 })

            const newTeam = await prisma.team.create({
                data: {
                    name: teamName,
                    password: teamPassword,
                    members: {
                        create: {
                            userId
                        }
                    }
                },
                select: { id: true, name: true }
            })

            return NextResponse.json({ success: true, team: newTeam }, { status: 201 })
        } else if(action === 'join') {
            if(!teamName || teamName.trim().length === 0) return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
            if(!teamPassword || teamPassword.trim().length === 0) return NextResponse.json({ error: 'Team password is required' }, { status: 400 })
            const team = await prisma.team.findUnique({ where: { name: teamName } })
            if(!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

            if(team.password !== teamPassword) return NextResponse.json({ error: 'Invalid team password' }, { status: 401 })

            const teamMember = await prisma.teamMember.create({
                data: {
                    userId,
                    teamId: team.id
                },
                select: { team: { select: { id: true, name: true } } }
            })

            return NextResponse.json({ success: true, team: teamMember.team }, { status: 201 })
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
