import AdminSettingsPage from "@/components/AdminSettingsPage"
import { notFound, unauthorized } from "next/navigation"
import { cookies } from "next/headers"
import db from "@/lib/db"

export default async function CTFAdminSettingsPage({ params }: { params: Promise<{id: string}> }) {
    const id = (await params).id.split('/')[0]
    const userId = await cookies().then(c => c.get(`ctf-${id}-user`)?.value)
    if(!userId || await db.user.findFirst({ where: { id: userId, ctfId: id }, select: { type: true } }).then(u => u?.type) !== 'admin') return unauthorized()
    const ctf = await db.cTF.findUnique({ where: { id }, select: { id: true, name: true, running: true } })
    if(!ctf) notFound()

    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./admin/<b className="green">settings</b></h1>
        <AdminSettingsPage ctf={ctf} />
    </>

}