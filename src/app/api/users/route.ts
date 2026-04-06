import { createServerSupabaseClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: users } = await supabase
            .from('User')
            .select('id, username, score, role, createdAt, active, hidden, TeamMember(team:Team(id, name))')

        const mapped = users?.map((user: any) => {
            const teamMember = user.TeamMember as any[]
            return({
                id: user.id,
                username: user.username,
                score: user.score,
                role: user.role,
                createdAt: user.createdAt,
                active: user.active,
                hidden: user.hidden,
                teamID: teamMember && teamMember.length > 0 ? teamMember[0].team?.id : null,
                teamName: teamMember && teamMember.length > 0 ? teamMember[0].team?.name : null
            })
        }) || []

        return successResponse(mapped)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
