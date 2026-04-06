import { createServerSupabaseClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST() {
    try {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.signOut()

        if(error) return errorResponse(error.message, 500)
        return successResponse({ message: 'Logged out successfully' })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
