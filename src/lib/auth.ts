import { createServerSupabaseClient } from './supabase-server'

export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getCurrentUserProfile() {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if(authError || !user) throw new Error('Unauthorized: User not authenticated')

    const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()

    if(profileError) throw new Error('Failed to fetch user profile')
    return profile
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if(!user) throw new Error('Unauthorized: User not authenticated')
    return user
}

export async function requireAdmin() {
    const profile = await getCurrentUserProfile()
    if(profile.role !== 'ADMIN') throw new Error('Forbidden: User is not an admin')
    return profile
}

export async function getUserScore(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('User')
        .select('score')
        .eq('id', userId)
        .single()

    if(error) throw error
    return data?.score ?? 0
}

export async function updateUserScore(userId: string, scoreChange: number) {
    const supabase = await createServerSupabaseClient()
    const currentScore = await getUserScore(userId)
    const newScore = Math.max(0, currentScore + scoreChange)

    const { error } = await supabase
        .from('User')
        .update({ score: newScore })
        .eq('id', userId)

    if(error) throw error
    return newScore
}

export async function getUserByEmail(email: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if(error) throw error

    const user = users.find(u => u.email === email)
    if(!user) throw new Error('User not found')
    return user
}

export async function validateTeamMembership(userId: string, teamId: number) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('TeamMember')
        .select('id')
        .eq('userId', userId)
        .eq('teamId', teamId)
        .single()

    if(error) return false
    return !!data
}

export function handleAuthError(error: unknown) {
    if(error instanceof Error) {
        if(error.message.includes('Unauthorized')) return { status: 401, message: 'Unauthorized' }
        if(error.message.includes('Forbidden')) return { status: 403, message: 'Forbidden' }
    }
    return { status: 500, message: 'Internal server error' }
}
