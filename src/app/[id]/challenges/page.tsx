import { ChallengeModal } from "@/components/ChallengeModal"
import db from "@/lib/db"
import { cookies } from "next/headers"

export default async function CTFChallengesPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split("/")[0]
    const challs = await db.challenge.findMany({ where: { ctfId: id }, select: { id: true, ctfId: true, name: true, points: true, description: true } })
    const userId = await cookies().then(c => c.get(`ctf-${id}-user`)?.value)
    let teamId: string | undefined = undefined
    const team = await db.team.findFirst({ where: { ctfId: id, userIDs: { has: userId } }, select: { id: true } })
    if (team) teamId = team.id

    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./<b className="green">challenges</b></h1>
        <div className="grid grid-cols-3 gap-4">
            {await Promise.all(challs.map(async chall => {
                const solvedIds = await db.challenge.findFirst({ where: { id: chall.id, ctfId: id }, select: { teamIDs: true } })
                return <ChallengeModal key={chall.id} chall={chall} solved={solvedIds?.teamIDs.includes(teamId as string) as boolean} />
            }))}
        </div>
    </>
}