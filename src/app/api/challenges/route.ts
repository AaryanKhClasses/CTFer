import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie')
        const tokenMatch = cookieHeader?.match(/auth=([^;]+)/)
        if (!tokenMatch) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        let payload
        try {
            payload = verifyJWT(tokenMatch[1])
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if(payload.role === 'ADMIN') {
            const challenges = await prisma.challenge.findMany({
                where: {},
                select: {
                    id: true,
                    title: true,
                    description: true,
                    category: true,
                    points: true,
                    type: true,
                    tags: true,
                    createdAt: true,
                    state: true,
                    flags: { select: { content: true, type: true } },
                    hints: { select: { content: true, cost: true } },
                    files: { select: { name: true } },
                },
            })
            return NextResponse.json(
                challenges.map((challenge) => ({
                    id: challenge.id,
                    title: challenge.title,
                    description: challenge.description,
                    category: challenge.category,
                    points: challenge.points,
                    type: challenge.type,
                    tags: challenge.tags,
                    flags: challenge.flags.map((f) => ({ content: f.content, type: f.type })),
                    hints: challenge.hints.map((h) => ({ content: h.content, cost: h.cost })),
                    files: [],
                    createdAt: challenge.createdAt,
                    state: challenge.state,
                }))
            )
        } else {
            const userId = Number(payload.sub)
            if(!Number.isInteger(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })

            const teamMember = await prisma.teamMember.findUnique({
                where: { userId },
                select: { teamId: true }
            })
            const teamId = teamMember?.teamId ?? null

            const challenges = await prisma.challenge.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    category: true,
                    points: true,
                    type: true,
                    tags: true,
                    state: true,
                    createdAt: true,
                    hints: { select: { cost: true } },
                },
            })
            const visibleChallenges = challenges.filter((c) => c.state === 'VISIBLE')
            const solvedByUserOrTeam = await prisma.solve.findMany({
                where: teamId ? { OR: [{ userId }, { teamId }] } : { userId },
                select: { challengeId: true }
            })
            const solvedIds = new Set(solvedByUserOrTeam.map(s => s.challengeId))

            return NextResponse.json(
                visibleChallenges.map((challenge) => ({
                    id: challenge.id,
                    title: challenge.title,
                    description: challenge.description,
                    category: challenge.category,
                    points: challenge.points,
                    type: challenge.type,
                    tags: challenge.tags,
                    createdAt: challenge.createdAt,
                    hints: challenge.hints.map((h) => ({ cost: h.cost })),
                    solved: solvedIds.has(challenge.id),
                }))
            )
        }
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie')
        const tokenMatch = cookieHeader?.match(/auth=([^;]+)/)
        if (!tokenMatch) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        let payload
        try {
            payload = verifyJWT(tokenMatch[1])
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const authorId = Number(payload.sub)
        if (!Number.isInteger(authorId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })

        const data = await request.json()
        const { title, description, category, points, type, flags, hints, state, tags } = data

        if (!title || typeof points !== 'number' || !type) {
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

        const newChallenge = await prisma.challenge.create({
            data: {
                title,
                description: description || '',
                category: category || 'Uncategorized',
                points: pointsValue,
                type: normalizedType,
                state: normalizedState,
                authorId,
                tags: tagValues,
                flags: flagData.length ? { create: flagData } : undefined,
                hints: hintData.length ? { create: hintData } : undefined,
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
        if(!newChallenge) return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
        return NextResponse.json({
            id: newChallenge.id,
            title: newChallenge.title,
            description: newChallenge.description,
            category: newChallenge.category,
            points: newChallenge.points,
            type: newChallenge.type,
            state: newChallenge.state,
            tags: newChallenge.tags,
            createdAt: newChallenge.createdAt,
            flags: newChallenge.flags.map((f) => ({ content: f.content, type: f.type })),
            hints: newChallenge.hints.map((h) => ({ content: h.content, cost: h.cost })),
            files: [],
        }, { status: 201 })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
