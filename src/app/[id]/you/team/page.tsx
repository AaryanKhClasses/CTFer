import { TeamMembersTable, TeamSolvedTable } from "@/components/UserTables"
import { cookies } from "next/headers"
import db from "@/lib/db"
import { CreateTeamModal } from "@/components/CreateTeamModal"

export default async function CTFYourTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split("/")[0]
    const userId = await cookies().then(c => c.get(`ctf-${id}-user`)?.value)
    let teamId: string | undefined = undefined
    let inTeam: boolean = false
    let users: { id: string, name: string, teamName: string | null, score: number }[] = []
    let challenges: { id: string, name: string, points: number }[] = []
    const team = await db.team.findFirst({ where: { ctfId: id, userIDs: { has: userId } }, select: { id: true, userIDs: true } })
    if (team) {
        teamId = team.id
        inTeam = true
        users = await db.user.findMany({ where: { id: { in: team.userIDs } }, select: { id: true, name: true, teamName: true, score: true } })
        challenges = await db.challenge.findMany({ where: { teamIDs: { has: teamId }, ctfId: id }, select: { id: true, name: true, points: true } })
    }

    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./you/<b className="green">team</b></h1>
        <div className="justify-self-end m-2"><CreateTeamModal id={id} userId={userId} inTeam={inTeam} /></div>
        <h1 className="text-center text-[1.75rem] font-semibold my-5">Team Members</h1>
        <TeamMembersTable users={users} />

        <h1 className="text-center text-[1.75rem] font-semibold my-5">Solved Challeges</h1>
        <TeamSolvedTable challenges={challenges}/>
    </>
}