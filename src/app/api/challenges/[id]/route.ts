import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const cookieHeader = request.headers.get('cookie')
        const tokenMatch = cookieHeader?.match(/auth=([^;]+)/)
        if(!tokenMatch) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        let payload
        try {
            payload = verifyJWT(tokenMatch[1])
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if(payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const challengeId = parseInt(id)
        if(isNaN(challengeId)) return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 })

        const data = await request.json()
        const { title, description, category, points, type, flags, hints, state, tags } = data

        if(!title || typeof points !== 'number' || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const normalizedState = ['VISIBLE', 'HIDDEN', 'LOCKED'].includes(state) ? state : 'VISIBLE'
        const normalizedType = typeof type === 'string' && type.trim().length > 0 ? type : 'Static'
        const pointsValue = Number.isFinite(points) ? Math.max(0, Math.trunc(points)) : 0

        const flagData = Array.isArray(flags) 
            ? flags.filter((f) => f && typeof f.content === 'string' && f.content.trim().length > 0)
                   .map((f) => ({
                       content: f.content,
                       type: ['CASE_SENSITIVE', 'CASE_INSENSITIVE'].includes(f.type) ? f.type : 'CASE_SENSITIVE'
                   }))
            : []
        const hintData = Array.isArray(hints)
            ? hints.filter((h) => h && typeof h.content === 'string' && h.content.trim().length > 0)
                   .map((h) => ({
                       content: h.content,
                       cost: typeof h.cost === 'number' ? Math.max(0, Math.trunc(h.cost)) : 0
                   }))
            : []
        const tagValues: string[] = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim().length > 0) : []

        const existing = await prisma.challenge.findUnique({
            where: { id: challengeId },
            select: { points: true }
        })

        const updatedChallenge = await prisma.challenge.update({
            where: { id: challengeId },
            data: {
                title,
                description: description ?? '',
                category: category ?? 'Uncategorized',
                points: pointsValue,
                type: normalizedType,
                state: normalizedState,
                tags: tagValues,
                flags: {
                    deleteMany: {},
                    create: flagData,
                },
                hints: {
                    deleteMany: {},
                    create: hintData,
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                points: true,
                type: true,
                state: true,
                tags: true,
                createdAt: true,
                flags: { select: { content: true, type: true } },
                hints: { select: { content: true, cost: true } },
            },
        })

        if(existing && typeof existing.points === 'number') {
            const delta = pointsValue - existing.points
            if(delta !== 0) {
                await prisma.solve.updateMany({
                    where: { challengeId },
                    data: { points: pointsValue }
                })
                const solves = await prisma.solve.findMany({
                    where: { challengeId },
                    select: { userId: true, teamId: true }
                })
                const affectedUserIds = Array.from(new Set(solves.map(s => s.userId)))
                const affectedTeamIds = Array.from(new Set(solves.map(s => s.teamId).filter((t): t is number => !!t)))
                for(const uid of affectedUserIds) {
                    await prisma.user.update({ where: { id: uid }, data: { score: { increment: delta } } })
                }
                for(const tid of affectedTeamIds) {
                    const members = await prisma.teamMember.findMany({
                        where: { teamId: tid },
                        select: { user: { select: { score: true } } }
                    })
                    const teamScore = members.reduce((acc, m) => acc + (m.user?.score ?? 0), 0)
                    await prisma.team.update({ where: { id: tid }, data: { score: teamScore } })
                }
            }
        }

        return NextResponse.json({
            id: updatedChallenge.id,
            title: updatedChallenge.title,
            description: updatedChallenge.description,
            category: updatedChallenge.category,
            points: updatedChallenge.points,
            type: updatedChallenge.type,
            state: updatedChallenge.state,
            tags: updatedChallenge.tags,
            createdAt: updatedChallenge.createdAt,
            flags: updatedChallenge.flags.map((f) => ({ content: f.content, type: f.type })),
            hints: updatedChallenge.hints.map((h) => ({ content: h.content, cost: h.cost })),
            files: [],
        }, { status: 200 })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const cookieHeader = request.headers.get('cookie')
        const tokenMatch = cookieHeader?.match(/auth=([^;]+)/)
        if(!tokenMatch) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        let payload
        try {
            payload = verifyJWT(tokenMatch[1])
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if(payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const challengeId = parseInt(id)
        if(isNaN(challengeId)) return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 })

        await prisma.challenge.delete({
            where: { id: challengeId },
        })

        return NextResponse.json({ success: true, message: 'Challenge deleted successfully' }, { status: 200 })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
