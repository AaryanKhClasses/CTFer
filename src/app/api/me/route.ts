import { createServerSupabaseClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if(authError || !user) return successResponse({ authenticated: false })

        const { data: profile, error: profileError } = await supabase
            .from('User')
            .select('id, username, role, score, active, hidden, createdAt')
            .eq('id', user.id)
            .single()

        if(profileError) {
            return successResponse({
                authenticated: true,
                user: {
                    id: user.id,
                    username: (user.user_metadata as any)?.username || user.email?.split('@')[0] || 'user',
                    email: user.email,
                    role: 'PLAYER',
                    score: 0,
                    active: true,
                    team: null
                }
            })
        }

        const { data: teamData } = await supabase
            .from('TeamMember')
            .select('team:Team(id, name)')
            .eq('userId', user.id)
            .single()

        return successResponse({
            authenticated: true,
            user: {
                id: profile.id,
                username: profile.username,
                email: user.email,
                role: profile.role,
                score: profile.score,
                active: profile.active,
                team: teamData?.team || null
            }
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
