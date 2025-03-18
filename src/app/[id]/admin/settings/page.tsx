import AdminSettingsPage from "@/components/AdminSettingsPage"
import db from "@/lib/db"
import { notFound } from "next/navigation"

export default async function CTFAdminSettingsPage({ params }: { params: Promise<{id: string}> }) {
    const id = (await params).id.split('/')[0]
    const ctf = await db.cTF.findUnique({ where: { id }, select: { id: true, name: true, running: true } })
    if(!ctf) notFound()

    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./admin/<b className="green">settings</b></h1>
        <AdminSettingsPage ctf={ctf} />
    </>

}