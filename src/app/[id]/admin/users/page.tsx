import { AdminUserTable } from "@/components/AdminTables"
import db from "@/lib/db"

export default async function CTFAdminUsersPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split('/')[0]
    const users = await db.user.findMany({ where: { ctfId: id }, select: { id: true, name: true, email: true, type: true, teamName: true, score: true } })
    
    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./admin/<b className="green">users</b></h1>
        <AdminUserTable users={users} />
    </>
}
