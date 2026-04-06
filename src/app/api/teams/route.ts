import { errorResponse, successResponse, unauthorizedResponse, validationError } from '@/lib/api-response'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: teams } = await supabase
            .from('Team')
            .select('id, name, score, createdAt, hidden')

        const mapped = teams?.map(team => ({
            id: team.id,
            name: team.name,
            score: team.score,
            createdAt: team.createdAt,
            hidden: team.hidden
        })) || []

        return successResponse(mapped)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if(!user) return unauthorizedResponse()

        const { action, teamName, teamPassword } = await request.json()

        const { data: existingTeamMember } = await supabase
            .from('TeamMember')
            .select('id')
            .eq('userId', user.id)
            .single()
        if(existingTeamMember) return errorResponse('User is already in a team', 400)

        if(action === 'create') {
            if(!teamName || teamName.trim().length === 0) return validationError('Team name is required')
            if(!teamPassword || teamPassword.trim().length === 0) return validationError('Team password is required')

            const { data: existingTeam } = await supabase
                .from('Team')
                .select('id')
                .eq('name', teamName)
                .single()

            if(existingTeam) return errorResponse('Team name already exists', 400)

            const { data: newTeam, error: createError } = await supabase
                .from('Team')
                .insert({ name: teamName, password: teamPassword })
                .select('id, name')
                .single()

            if(createError || !newTeam) return errorResponse('Failed to create team', 500)

            await supabase
                .from('TeamMember')
                .insert({ userId: user.id, teamId: newTeam.id })

            return successResponse({ team: newTeam }, 201)
        } else if(action === 'join') {
            if(!teamName || teamName.trim().length === 0) return validationError('Team name is required')
            if(!teamPassword || teamPassword.trim().length === 0) return validationError('Team password is required')

            const { data: team } = await supabase
                .from('Team')
                .select('id, password')
                .eq('name', teamName)
                .single()

            if(!team) return errorResponse('Team not found', 404)

            if(team.password !== teamPassword) return errorResponse('Invalid team password', 401)
            const { data: teamMember, error: joinError } = await supabase
                .from('TeamMember')
                .insert({ userId: user.id, teamId: team.id })
                .select('team:Team(id, name)')
                .single()

            if(joinError || !teamMember) return errorResponse('Failed to join team', 500)
            return successResponse({ team: teamMember.team }, 201)
        } else {
            return validationError('Invalid action')
        }
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
