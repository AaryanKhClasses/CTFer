import { errorResponse, forbiddenResponse, successResponse, unauthorizedResponse, validationError } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const profile = await getCurrentUser()
        if(!profile) return unauthorizedResponse()

        const superbaseClient = await createServerSupabaseClient()
        const { data: userProfiler } = await superbaseClient
            .from('User')
            .select('role')
            .eq('id', profile.id)
            .single()

        if(userProfiler?.role !== 'ADMIN') return forbiddenResponse()

        const { data: submissions } = await superbaseClient
            .from('Submission')
            .select('id, userId, teamId, challengeId, submitted, correct, submittedAt, user:User(username), team:Team(name), challenge:Challenge(title)')

        const mapped = submissions?.map((sub: any) => ({
            id: sub.id,
            username: sub.user?.username,
            teamName: sub.team?.name,
            challengeTitle: sub.challenge?.title,
            submitted: sub.submitted,
            correct: sub.correct,
            submittedAt: sub.submittedAt
        })) || []

        return successResponse(mapped)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function POST(request: Request) {
    const { challengeId, flag } = await request.json()
    if(!challengeId) return validationError('Invalid Challenge.')
    if(!flag) return validationError('Flag cannot be empty.')

    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if(!user) return unauthorizedResponse()

        const { data: teamMember } = await supabase
            .from('TeamMember')
            .select('teamId')
            .eq('userId', user.id)
            .single()

        const teamId = teamMember?.teamId ?? null

        const { data: challenge } = await supabase
            .from('Challenge')
            .select('points, Flag(content, type)')
            .eq('id', challengeId)
            .single()

        if(!challenge) return errorResponse('Challenge not found.', 404)

        const isCorrect = challenge.Flag.some(f => {
            if(f.type === 'CASE_INSENSITIVE') return f.content.toLowerCase() === flag.toLowerCase()
            else return f.content === flag
        })

        await supabase
            .from('Submission')
            .insert({
                userId: user.id,
                teamId: teamId || null,
                challengeId: challengeId,
                submitted: flag,
                correct: isCorrect
            })

        if(!isCorrect) {
            return errorResponse('Incorrect flag.', 200)
        }

        const { data: existingSolve } = await supabase
            .from('Solve')
            .select('id')
            .or(`userId.eq.${user.id},teamId.eq.${teamId || -1}`)
            .eq('challengeId', challengeId)
            .single()

        if(existingSolve) return successResponse({ message: 'Correct flag!' })

        await supabase
            .from('Solve')
            .insert({
                userId: user.id,
                teamId: teamId || null,
                challengeId: challengeId,
                points: challenge.points
            })

        const { data: userProfile } = await supabase
            .from('User')
            .select('score')
            .eq('id', user.id)
            .single()

        if(userProfile) {
            await supabase
                .from('User')
                .update({ score: (userProfile.score || 0) + challenge.points })
                .eq('id', user.id)
        }

        if(teamId) {
            const { data: members } = await supabase
                .from('TeamMember')
                .select('user:User(score)')
                .eq('teamId', teamId)

            const teamScore = members?.reduce((acc, m: any) => {
                const memberUser = m.user as unknown as {score: number}
                return acc + ((memberUser?.score) || 0)
            }, 0) || 0
            await supabase
                .from('Team')
                .update({ score: teamScore })
                .eq('id', teamId)
        }
        return successResponse({ message: 'Correct flag!' })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
