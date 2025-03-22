import CreateChallengeModal from "@/components/CreateChallengeModal"
import { AdminChallengeTable } from "@/components/AdminTables"
import { unauthorized } from "next/navigation"
import { cookies } from "next/headers"
import db from "@/lib/db"

export default async function CTFAdminChallengesPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split('/')[0]
    const userId = await cookies().then(c => c.get(`ctf-${id}-user`)?.value)
    if(!userId || await db.user.findFirst({ where: { id: userId, ctfId: id }, select: { type: true } }).then(u => u?.type) !== 'admin') return unauthorized()
    const challenges = await db.challenge.findMany({ where: { ctfId: id }, select: { id: true, name: true, points: true, flag: true, ctfId: true, category: true, enabled: true, description: true } })
    
    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./admin/<b className="green">challenges</b></h1>
        <div className="justify-self-end m-2"><CreateChallengeModal id={id} /></div>
        <AdminChallengeTable challenges={challenges} />
    </>
}
