import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import Nav from "@/components/Nav"
import db from "@/lib/db"

export default async function CTFLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{id: string}> }>) {
    const id = (await params).id.split('/')[0]
    const ctf = await db.cTF.findUnique({ where: { id } })
    if(!ctf) return notFound()

    const cookie = await cookies()
    const userCookie = cookie.get(`ctf-${id}-user`)?.value
    let user = null
    if(userCookie) user = await db.user.findUnique({ where: { id: userCookie, ctfId: id } })

    return <>
        <h1 className="text-[2rem] text-center">{ctf.name}</h1>
        <Nav id={id} user={user} />
        <div className="my-6 px-3 flex flex-col min-h-screen">
            <div className="flex-grow">{children}</div>
        </div>
    </>
}