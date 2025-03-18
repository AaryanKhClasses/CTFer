"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import db from "./db"

type ChallengeProps = {
    ctfId: string
    name: string
    points: number
    flag: string
    description: string
}

export async function addChallenge(data: ChallengeProps) {
    const { ctfId, name, points, flag, description } = data
    if(await db.challenge.findFirst({ where: { name, ctfId } })) throw new Error("Challenge with the name already exists!")
    await db.challenge.create({ data: { name, points, flag, description, ctfId, category: 'default' } })
    revalidatePath(`/${ctfId}`)
}

export async function toggleChallenge(id: string, ctfId: string, enabled: boolean) {
    await db.challenge.update({ where: { id, ctfId }, data: { enabled } })
    revalidatePath(`/${ctfId}`)
}

export async function deleteChallenge(id: string, ctfId: string) {
    await db.challenge.delete({ where: { id, ctfId } })
    revalidatePath(`/${ctfId}`)
}

export async function editChallenge(data: ChallengeProps & { id: string }) {
    const { id, ctfId, name, points, flag, description } = data
    await db.challenge.update({ where: { id, ctfId }, data: { name, points, flag, description } })
    revalidatePath(`/${ctfId}`)
}

export async function validateFlag(id: string, ctfId: string, flag: string) {
    const challenge = await db.challenge.findFirst({ where: { id, ctfId } })
    if(!challenge) throw new Error("Challenge not found!")
    const userId = await cookies().then(c => c.get(`ctf-${ctfId}-user`)?.value)
    if(challenge.flag === flag) {
        const user = await db.user.findFirst({ where: { id: userId, ctfId } })
        const teamId = await db.team.findFirst({ where: { id: user?.teamId as string, ctfId } }).then(t => t?.id)
        await db.user.update({ where: { id: userId, ctfId }, data: { score: { increment: challenge.points }, challengeIDs: { push: id } } })
        await db.challenge.update({ where: { id, ctfId }, data: { teamIDs: { push: teamId } } })
        await db.team.update({ where: { id: teamId, ctfId }, data: { netScore: { increment: challenge.points }, challengeIDs: { push: id } } })
    } else {
        throw new Error("Incorrect flag!")
    }
    revalidatePath(`/${ctfId}/challenges`)
}