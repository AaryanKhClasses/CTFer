import { AdminTeamTable } from "@/components/AdminTables"
import db from "@/lib/db"

export default async function CTFAdminTeamsPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split('/')[0]
    const teams = await db.team.findMany({ where: { ctfId: id }, select: { id: true, name: true, netScore: true } })
    
    return <>
        <h1 className="text-[2rem] text-center">Admin Teams Page</h1>
        <AdminTeamTable teams={teams} />
    </>
}
