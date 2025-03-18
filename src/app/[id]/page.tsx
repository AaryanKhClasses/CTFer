import { notFound } from "next/navigation"
import db from "@/lib/db"

export default async function CTFHomePage({ params }: { params: Promise<{id: string}> }) {
    const id = (await params).id
    const ctf = await db.cTF.findUnique({ where: { id } })
    if(!ctf) return notFound()
    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./<b className="green">home</b></h1>
    </>
}