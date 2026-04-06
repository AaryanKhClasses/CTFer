import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if(!user) return unauthorizedResponse()

        const supabase = await createServerSupabaseClient()
        const { data: teamMember } = await supabase
            .from('TeamMember')
            .select('teamId')
            .eq('userId', user.id)
            .single()

        if(!teamMember) return successResponse({ hasTeam: false })

        const { data: team } = await supabase
            .from('Team')
            .select('id, name, score, createdAt, hidden, TeamMember(user:User(id, username, score)), Solve(id, challengeId, points, solvedAt, challenge:Challenge(title)), Submission(correct, submittedAt)')
            .eq('id', teamMember.teamId)
            .single()
        if(!team) return errorResponse('Team not found', 404)

        const teamData = team as any
        const teamMembers = teamData.TeamMember || []
        const solves = teamData.Solve || []
        const submissions = teamData.Submission || []

        const totalSubmissions = submissions.length
        const correctSubmissions = submissions.filter((s: any) => s.correct).length
        const wrongSubmissions = totalSubmissions - correctSubmissions

        return successResponse({
            hasTeam: true,
            team: {
                id: teamData.id,
                name: teamData.name,
                score: teamData.score,
                createdAt: teamData.createdAt,
                hidden: teamData.hidden,
                members: teamMembers.map((tm: any) => ({
                    id: tm.user.id,
                    username: tm.user.username,
                    score: tm.user.score
                })),
                solves: solves.map((solve: any) => ({
                    id: solve.id,
                    title: solve.challenge.title,
                    points: solve.points,
                    solvedAt: solve.solvedAt
                })),
                stats: {
                    totalSubmissions,
                    correctSubmissions,
                    wrongSubmissions,
                    correctPercentage: totalSubmissions > 0 ? parseFloat(((correctSubmissions / totalSubmissions) * 100).toFixed(2)) : 0,
                    wrongPercentage: totalSubmissions > 0 ? parseFloat(((wrongSubmissions / totalSubmissions) * 100).toFixed(2)) : 0
                }
            }
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
