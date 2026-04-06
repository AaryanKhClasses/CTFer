import { errorResponse, notFoundResponse, successResponse, validationError } from '@/lib/api-response'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const teamId = parseInt(id)
        if(isNaN(teamId)) return validationError('Invalid team ID')

        const supabase = await createServerSupabaseClient()
        const { data: team } = await supabase
            .from('Team')
            .select('id, name, score, createdAt, hidden')
            .eq('id', teamId)
            .eq('hidden', false)
            .single()

        if(!team) return notFoundResponse('Team not found')

        return successResponse({
            id: team.id,
            name: team.name,
            score: team.score,
            createdAt: team.createdAt,
            hidden: team.hidden
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const teamId = parseInt(id)
        if(isNaN(teamId)) return validationError('Invalid team ID')

        const supabase = await createServerSupabaseClient()
        const { data: team } = await supabase
            .from('Team')
            .select('hidden')
            .eq('id', teamId)
            .single()

        if(!team) return notFoundResponse('Team not found')

        const { data: updated } = await supabase
            .from('Team')
            .update({ hidden: !team.hidden })
            .eq('id', teamId)
            .select('id, name, score, createdAt, hidden')
            .single()

        if(!updated) return errorResponse('Failed to update team', 500)

        return successResponse({
            id: updated.id,
            name: updated.name,
            score: updated.score,
            createdAt: updated.createdAt,
            hidden: updated.hidden
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
