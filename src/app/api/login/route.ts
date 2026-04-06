import { createServerSupabaseClient } from '@/lib/supabase-server'
import { successResponse, validationError, errorResponse } from '@/lib/api-response'

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()
        if(!email || !password) return validationError('Missing fields')

        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email, password
        })

        if(signInError || !user) return errorResponse('Invalid credentials', 401)
        return successResponse({ id: user.id, email: user.email })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
