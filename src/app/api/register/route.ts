import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import { successResponse, validationError, errorResponse } from '@/lib/api-response'

export async function POST(req: Request) {
    try {
        const { email, username, password } = await req.json()
        if(!email || !username || !password) return validationError('Missing fields')
        if(password.length < 6) return validationError('Password must be at least 6 characters long')

        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        })

        if(signUpError) return validationError(signUpError.message)
        if(!user) return errorResponse('Failed to create user', 500)

        const supabaseAdmin = createServiceRoleClient()
        const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({ username })
            .eq('id', user.id)

        if(updateError) {
            console.error('Failed to update username:', updateError.message)
            return errorResponse('Failed to update user profile', 500)
        }

        const { data: { user: signedInUser }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if(signInError) console.warn('Auto-login after signup failed:', signInError.message)
        return successResponse({ id: user.id, email: user.email }, 201)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
