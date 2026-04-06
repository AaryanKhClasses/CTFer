import { errorResponse, forbiddenResponse, successResponse, unauthorizedResponse, validationError } from '@/lib/api-response'
import { getCurrentUserProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if(!user) return unauthorizedResponse()

        const { data: profile } = await supabase
            .from('User')
            .select('role')
            .eq('id', user.id)
            .single()

        if(profile?.role === 'ADMIN') {
            const { data: challenges, error } = await supabase
                .from('Challenge')
                .select('id, title, description, category, points, type, tags, createdAt, state, Flag(content, type), Hint(content, cost)')

            if(error) throw error

            return successResponse(challenges.map(c => ({
                id: c.id,
                title: c.title,
                description: c.description,
                category: c.category,
                points: c.points,
                type: c.type,
                tags: c.tags,
                state: c.state,
                createdAt: c.createdAt,
                flags: c.Flag.map(f => ({ content: f.content, type: f.type })),
                hints: c.Hint.map(h => ({ content: h.content, cost: h.cost })),
                files: []
            })))
        } else {
            const { data: teamMember } = await supabase
                .from('TeamMember')
                .select('teamId')
                .eq('userId', user.id)
                .single()

            const { data: challenges, error } = await supabase
                .from('Challenge')
                .select('id, title, description, category, points, type, tags, state, createdAt, Hint(cost)')
                .eq('state', 'VISIBLE')

            if(error) throw error

            const { data: solves } = await supabase
                .from('Solve')
                .select('challengeId')
                .or(`userId.eq.${user.id},teamId.eq.${teamMember?.teamId || -1}`)

            const solvedIds = new Set(solves?.map(s => s.challengeId) || [])

            return successResponse(challenges.map(c => ({
                id: c.id,
                title: c.title,
                description: c.description,
                category: c.category,
                points: c.points,
                type: c.type,
                tags: c.tags,
                createdAt: c.createdAt,
                hints: c.Hint.map(h => ({ cost: h.cost })),
                solved: solvedIds.has(c.id)
            })))
        }
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function POST(request: Request) {
    try {
        const profile = await getCurrentUserProfile()

        if(profile.role !== 'ADMIN') return forbiddenResponse()

        const data = await request.json()
        const { title, description, category, points, type, flags, hints, state, tags } = data

        if(!title || typeof points !== 'number' || !type) {
            return validationError('Missing required fields')
        }

        const normalizedState = ['VISIBLE', 'HIDDEN', 'LOCKED'].includes(state) ? state : 'VISIBLE'
        const normalizedType = typeof type === 'string' && type.trim().length > 0 ? type : 'Static'
        const pointsValue = Number.isFinite(points) ? Math.max(0, Math.trunc(points)) : 0

        const flagData = Array.isArray(flags)
            ? flags.filter(f => f && typeof f.content === 'string' && f.content.trim().length > 0)
                   .map(f => ({
                       content: f.content,
                       type: ['CASE_SENSITIVE', 'CASE_INSENSITIVE'].includes(f.type) ? f.type : 'CASE_SENSITIVE'
                   }))
            : []
        const hintData = Array.isArray(hints)
            ? hints.filter(h => h && typeof h.content === 'string' && h.content.trim().length > 0)
                   .map(h => ({
                       content: h.content,
                       cost: typeof h.cost === 'number' ? Math.max(0, Math.trunc(h.cost)) : 0
                   }))
            : []
        const tagValues = Array.isArray(tags) ? tags.filter(t => typeof t === 'string' && t.trim().length > 0) : []

        const supabase = await createServerSupabaseClient()
        const { data: challenge, error } = await supabase
            .from('Challenge')
            .insert({
                title,
                description: description || '',
                category: category || 'Uncategorized',
                points: pointsValue,
                type: normalizedType,
                state: normalizedState,
                authorId: profile.id,
                tags: tagValues
            })
            .select('id, title, description, category, points, type, state, tags, createdAt')
            .single()

        if(error || !challenge) throw error

        if(flagData.length) {
            await supabase.from('Flag').insert(
                flagData.map(f => ({ challengeId: challenge.id, ...f }))
            )
        }

        if(hintData.length) {
            await supabase.from('Hint').insert(
                hintData.map(h => ({ challengeId: challenge.id, ...h }))
            )
        }

        const { data: flagsData } = await supabase
            .from('Flag')
            .select('content, type')
            .eq('challengeId', challenge.id)

        const { data: hintsData } = await supabase
            .from('Hint')
            .select('content, cost')
            .eq('challengeId', challenge.id)

        return successResponse({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            points: challenge.points,
            type: challenge.type,
            state: challenge.state,
            tags: challenge.tags,
            createdAt: challenge.createdAt,
            flags: flagsData || [],
            hints: hintsData || [],
            files: []
        }, 201)
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
