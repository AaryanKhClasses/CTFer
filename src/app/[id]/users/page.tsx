import { UserTable } from "@/components/UserTables"
import db from "@/lib/db"

export default async function CTFUsersPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id.split('/')[0]
    const users = await db.user.findMany({ where: { ctfId: id }, select: { id: true, name: true, teamName: true, score: true } })

    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./<b className="green">users</b></h1>
        <UserTable users={users} />
    </>
}