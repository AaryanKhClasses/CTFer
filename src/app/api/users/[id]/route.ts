import { errorResponse, notFoundResponse, successResponse } from '@/lib/api-response'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = id

        const supabase = await createServerSupabaseClient()
        const { data: user } = await supabase
            .from('User')
            .select('id, username, score, role, createdAt, active, hidden, TeamMember(team:Team(id, name, score)), Solve(challenge:Challenge(id, title, points), points, solvedAt)')
            .eq('id', userId)
            .single()

        if(!user) return notFoundResponse('User not found')

        const userData = user as any
        const teamMember = userData.TeamMember as any[]
        const userSolves = userData.Solve as any[]

        return successResponse({
            id: userData.id,
            username: userData.username,
            score: userData.score,
            role: userData.role,
            createdAt: userData.createdAt,
            active: userData.active,
            hidden: userData.hidden,
            teamName: teamMember && teamMember.length > 0 ? teamMember[0].team?.name : null,
            solves: userSolves.map(s => ({
                id: s.challenge.id,
                title: s.challenge.title,
                points: s.points,
                solvedAt: s.solvedAt
            }))
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = id

        const supabase = await createServerSupabaseClient()
        const { data: user } = await supabase
            .from('User')
            .select('id, active')
            .eq('id', userId)
            .single()
        if(!user) return notFoundResponse('User not found')

        const { data: updated } = await supabase
            .from('User')
            .update({ active: false })
            .eq('id', userId)
            .select('id, username, score, role, createdAt, active, hidden')
            .single()
        if(!updated) return errorResponse('Failed to deactivate user', 500)

        return successResponse({
            id: updated.id,
            username: updated.username,
            score: updated.score,
            role: updated.role,
            createdAt: updated.createdAt,
            active: updated.active,
            hidden: updated.hidden
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const userId = id

        const supabase = await createServerSupabaseClient()
        const { data: user } = await supabase
            .from('User')
            .select('hidden')
            .eq('id', userId)
            .single()
        if(!user) return notFoundResponse('User not found')

        const { data: updated } = await supabase
            .from('User')
            .update({ hidden: !user.hidden })
            .eq('id', userId)
            .select('id, username, score, role, createdAt, active, hidden')
            .single()

        if(!updated) return errorResponse('Failed to update user', 500)

        return successResponse({
            id: updated.id,
            username: updated.username,
            score: updated.score,
            role: updated.role,
            createdAt: updated.createdAt,
            active: updated.active,
            hidden: updated.hidden
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
