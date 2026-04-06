import { createServiceRoleClient } from '@/lib/supabase-server'
import { successResponse, validationError, errorResponse } from '@/lib/api-response'

export async function POST(req: Request) {
    try {
        const { name, description, adminUsername, adminEmail, adminPassword, teamSize, logoURL, startTime, endTime } = await req.json()

        if(!name || !adminUsername || !adminEmail || !adminPassword) return validationError('Missing required fields')

        const supabase = createServiceRoleClient()
        const { data: user, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            user_metadata: { username: adminUsername }
        })

        if(authError || !user) return errorResponse('Failed to create admin user', 500)

        await supabase
            .from('User')
            .update({ username: adminUsername, role: 'ADMIN', hidden: true })
            .eq('id', user.user.id)

        const { data: settings, error: settingsError } = await supabase
            .from('Settings')
            .insert({
                name,
                description,
                teamSize: teamSize || 1,
                logoURL: logoURL || '',
                startTime: startTime ? new Date(startTime).toISOString() : null,
                endTime: endTime ? new Date(endTime).toISOString() : null
            })
            .select()

        if(settingsError) return errorResponse('Failed to create settings', 500)
        return successResponse({ setup: true }, 201)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function GET() {
    try {
        const supabase = createServiceRoleClient()
        const { data: settings } = await supabase
            .from('Settings')
            .select('id')
            .limit(1)

        if(settings && settings.length > 0) return successResponse({ setup: true })
        else return successResponse({ setup: false })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
