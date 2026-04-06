import { errorResponse, forbiddenResponse, notFoundResponse, successResponse, validationError } from '@/lib/api-response'
import { getCurrentUserProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const profile = await getCurrentUserProfile()
        if(profile.role !== 'ADMIN') return forbiddenResponse()

        const challengeId = parseInt(id)
        if(isNaN(challengeId)) return validationError('Invalid challenge ID')

        const data = await request.json()
        const { title, description, category, points, type, flags, hints, state, tags } = data
        if(!title || typeof points !== 'number' || !type) return validationError('Missing required fields')

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
        const { data: existing } = await supabase
            .from('Challenge')
            .select('points')
            .eq('id', challengeId)
            .single()

        const { data: updated, error: updateError } = await supabase
            .from('Challenge')
            .update({
                title,
                description: description ?? '',
                category: category ?? 'Uncategorized',
                points: pointsValue,
                type: normalizedType,
                state: normalizedState,
                tags: tagValues
            })
            .eq('id', challengeId)
            .select('id, title, description, category, points, type, state, tags, createdAt')
            .single()

        if(updateError || !updated) return notFoundResponse('Challenge not found')

        await supabase.from('Flag').delete().eq('challengeId', challengeId)
        await supabase.from('Hint').delete().eq('challengeId', challengeId)

        if(flagData.length) {
            await supabase.from('Flag').insert(
                flagData.map(f => ({ challengeId, ...f }))
            )
        }

        if(hintData.length) {
            await supabase.from('Hint').insert(
                hintData.map(h => ({ challengeId, ...h }))
            )
        }

        if(existing && typeof existing.points === 'number') {
            const delta = pointsValue - existing.points
            if(delta !== 0) {
                const { data: solves } = await supabase
                    .from('Solve')
                    .select('userId, teamId')
                    .eq('challengeId', challengeId)

                const affectedUserIds = Array.from(new Set(solves?.map(s => s.userId) || []))
                const affectedTeamIds = Array.from(new Set(solves?.map(s => s.teamId).filter(t => !!t) || []))

                for(const userId of affectedUserIds) {
                    const { data: user } = await supabase
                        .from('User')
                        .select('score')
                        .eq('id', userId)
                        .single()

                    if(user) {
                        await supabase
                            .from('User')
                            .update({ score: (user.score || 0) + delta })
                            .eq('id', userId)
                    }
                }

                for(const teamId of affectedTeamIds) {
                    const { data: members } = await supabase
                        .from('TeamMember')
                        .select('user:User(score)')
                        .eq('teamId', teamId)

                    const teamScore = members?.reduce((acc, m) => {
                        const memberUser = m.user as unknown as {score: number}
                        return acc + ((memberUser?.score) || 0)
                    }, 0) || 0
                    await supabase
                        .from('Team')
                        .update({ score: teamScore })
                        .eq('id', teamId)
                }
            }
        }

        const { data: retrievedFlags } = await supabase
            .from('Flag')
            .select('content, type')
            .eq('challengeId', challengeId)

        const { data: retrievedHints } = await supabase
            .from('Hint')
            .select('content, cost')
            .eq('challengeId', challengeId)

        return successResponse({
            id: updated.id,
            title: updated.title,
            description: updated.description,
            category: updated.category,
            points: updated.points,
            type: updated.type,
            state: updated.state,
            tags: updated.tags,
            createdAt: updated.createdAt,
            flags: retrievedFlags || [],
            hints: retrievedHints || [],
            files: []
        })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const profile = await getCurrentUserProfile()
        if(profile.role !== 'ADMIN') return forbiddenResponse()

        const challengeId = parseInt(id)
        if(isNaN(challengeId)) return validationError('Invalid challenge ID')

        const supabase = await createServerSupabaseClient()
        const { error } = await supabase
            .from('Challenge')
            .delete()
            .eq('id', challengeId)

        if(error) return notFoundResponse('Challenge not found')

        return successResponse({ message: 'Challenge deleted successfully' })
    } catch(err) {
        console.error(err)
        return errorResponse('Internal Server Error', 500)
    }
}
