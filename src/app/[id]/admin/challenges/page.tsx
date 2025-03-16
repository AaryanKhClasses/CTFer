import CreateChallengeModal from "@/components/CreateChallengeModal"
import { AdminChallengeTable } from "@/components/AdminTables"
import db from "@/lib/db"

export default async function CTFAdminChallengesPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split('/')[0]
    const challenges = await db.challenge.findMany({ where: { ctfId: id }, select: { id: true, name: true, points: true, flag: true, ctfId: true, category: true, enabled: true, description: true } })
    
    return <>
        <h1 className="text-[2rem] text-center">Admin Challenges Page</h1>
        <div className="justify-self-end m-2"><CreateChallengeModal id={id} /></div>
        <AdminChallengeTable challenges={challenges} />
    </>
}
