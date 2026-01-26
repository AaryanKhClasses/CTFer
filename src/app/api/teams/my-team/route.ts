import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const cookie = request.headers.get('cookie')
    if(!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const match = cookie.match(/auth=([^;]+)/)
    if(!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const payload = verifyJWT(match[1])
        const userId = parseInt(payload.sub as string)

        const teamMember = await prisma.teamMember.findUnique({
            where: { userId },
            select: { teamId: true }
        })

        if(!teamMember) return NextResponse.json({ hasTeam: false })

        const team = await prisma.team.findUnique({
            where: { id: teamMember.teamId },
            select: {
                id: true,
                name: true,
                score: true,
                createdAt: true,
                hidden: true,
                members: {
                    select: {
                        user: {
                            select: { id: true, username: true, score: true }
                        }
                    }
                },
                solves: {
                    select: {
                        id: true,
                        challengeId: true,
                        points: true,
                        solvedAt: true,
                        challenge: { select: { title: true } }
                    },
                },
                submissions: {
                    select: {
                        correct: true,
                        submittedAt: true
                    }
                }
            }
        })

        if(!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

        const totalSubmissions = team.submissions.length
        const correctSubmissions = team.submissions.filter(s => s.correct).length
        const wrongSubmissions = totalSubmissions - correctSubmissions

        return NextResponse.json({
            hasTeam: true,
            team: {
                id: team.id,
                name: team.name,
                score: team.score,
                createdAt: team.createdAt,
                hidden: team.hidden,
                members: team.members.map(member => ({
                    id: member.user.id,
                    username: member.user.username,
                    score: member.user.score
                })),
                solves: team.solves.map(solve => ({
                    id: solve.id,
                    title: solve.challenge.title,
                    points: solve.points,
                    solvedAt: solve.solvedAt
                })),
                stats: {
                    totalSubmissions,
                    correctSubmissions,
                    wrongSubmissions,
                    correctPercentage: totalSubmissions > 0 ? parseFloat((correctSubmissions / totalSubmissions * 100).toFixed(2)) : 0,
                    wrongPercentage: totalSubmissions > 0 ? parseFloat((wrongSubmissions / totalSubmissions * 100).toFixed(2)) : 0
                }
            }
        })
    } catch(err) {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
