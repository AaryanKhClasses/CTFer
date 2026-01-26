import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = parseInt(id)
        if(isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teamMember: {
                    select: { team: { select: { id: true, name: true, score: true } } }
                },
                solves: {
                    select: {
                        challenge: { select: { id: true, title: true, points: true } },
                        points: true,
                        solvedAt: true
                    },
                }
            }
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
            teamName: user.teamMember?.team?.name ?? null,
            solves: (user.solves || []).map(s => ({
                id: s.challenge.id,
                title: s.challenge.title,
                points: s.points,
                solvedAt: s.solvedAt
            }))
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = parseInt(id)
        if(isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if(!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        
        const deletedUser = await prisma.user.update({ where: { id: userId }, data: { active: false } })
        if(!deletedUser) return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })

        return NextResponse.json({
            id: deletedUser.id,
            username: deletedUser.username,
            score: deletedUser.score,
            role: deletedUser.role,
            createdAt: deletedUser.createdAt,
            active: deletedUser.active,
            hidden: deletedUser.hidden,
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = parseInt(id)
        if(isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if(!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { hidden: !user.hidden }
        })
        if(!updatedUser) return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
        return NextResponse.json({
            id: updatedUser.id,
            username: updatedUser.username,
            score: updatedUser.score,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            active: updatedUser.active,
            hidden: updatedUser.hidden,
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
