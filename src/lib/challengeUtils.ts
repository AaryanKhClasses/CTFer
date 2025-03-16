"use server"

import { revalidatePath } from "next/cache"
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