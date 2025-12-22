import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { challengeId, flag } = await request.json()
    if(!challengeId) return NextResponse.json({ success: false, message: 'Invalid Challenge.' }, { status: 400 })
    if(!flag) return NextResponse.json({ success: false, message: 'Flag cannot be empty.' }, { status: 400 })

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
        const userId = Number(payload.sub)
        if(!Number.isInteger(userId)) return NextResponse.json({ success: false, message: 'Invalid user.' }, { status: 400 })
        const teamMember = await prisma.teamMember.findUnique({
            where: { userId },
            select: { teamId: true }
        })
        const teamId = teamMember?.teamId ?? null
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            select: { points: true, flags: { select: { content: true, type: true } } }
        })
        if(!challenge) return NextResponse.json({ success: false, message: 'Challenge not found.' }, { status: 404 })
        const isCorrect = challenge.flags.some((f) => {
            if(f.type === 'CASE_INSENSITIVE') return f.content.toLowerCase() === flag.toLowerCase()
            else return f.content === flag
        })

        const submission = await prisma.submission.create({
            data: {
                userId: userId,
                teamId: teamId ?? undefined,
                challengeId: challengeId,
                submitted: flag,
                correct: isCorrect,
            }
        })
        if(!submission) return NextResponse.json({ success: false, message: 'Could not record submission.' }, { status: 500 })
        if(!isCorrect) return NextResponse.json({ success: false, message: 'Incorrect flag.' }, { status: 200 })
        const existingSolve = await prisma.solve.findFirst({
            where: {
                OR: [ { userId }, { teamId } ],
                challengeId: challengeId,
            }
        })
        if(existingSolve) return NextResponse.json({ success: true, message: 'Correct flag!' })
        const solve = await prisma.solve.create({
            data: {
                userId: userId,
                teamId: teamId ?? undefined,
                challengeId: challengeId,
                points: challenge.points
            }
        })
        if(!solve) return NextResponse.json({ success: false, message: 'Could not record solve.' }, { status: 500 })
        await prisma.user.update({
            where: { id: userId },
            data: { score: { increment: challenge.points } }
        })
        if(teamId) {
            const members = await prisma.teamMember.findMany({
                where: { teamId },
                select: { user: { select: { score: true } } }
            })
            const teamScore = members.reduce((acc, m) => acc + (m.user?.score ?? 0), 0)
            await prisma.team.update({ where: { id: teamId }, data: { score: teamScore } })
        }
        return NextResponse.json({ success: true, message: 'Correct flag!' })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
}
