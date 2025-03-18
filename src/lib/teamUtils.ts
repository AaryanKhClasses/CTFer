"use server"

import { revalidatePath } from "next/cache"
import db from "./db"

type CreateTeamProps = {
    ctfId: string
    userId: string
    teamName: string
}

type JoinTeamProps = {
    ctfId: string
    userId: string
    teamId: string
}

export async function createTeam(data: CreateTeamProps) {
    const { ctfId, userId, teamName } = data
    if(await db.team.findFirst({ where: { name: teamName } })) throw new Error("Team with the name already exists!")
    if(await db.team.findFirst({ where: { userIDs: { has: userId } } })) throw new Error("You are already in a team!")
    const team = await db.team.create({ data: { name: teamName, ctfId, userIDs: [userId] } })
    await db.user.update({ where: { id: userId }, data: { teamId: team.id, teamName: team.name } })
    revalidatePath(`/${ctfId}/you/team`)
}

export async function joinTeam(data: JoinTeamProps) {
    const { ctfId, userId, teamId } = data
    const team = await db.team.findFirst({ where: { id: teamId } })
    if (!team) throw new Error("Team not found!")
    await db.team.update({ where: { id: team.id }, data: { userIDs: [...team.userIDs, userId] } })
    await db.user.update({ where: { id: userId }, data: { teamId: team.id, teamName: team.name } })
    revalidatePath(`/${ctfId}/you/team`)
}