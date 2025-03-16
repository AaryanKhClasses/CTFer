"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import db from "./db"

type CTFProps = {
    name: string
    adminName: string
    adminEmail: string
    adminPassword: string
}

export async function registerCTF(data: CTFProps) {
    const { name, adminName, adminEmail, adminPassword } = data
    if(await db.cTF.findFirst({ where: { name } })) throw new Error("CTF with the name already exists!")

    const id = await db.cTF.create({ data: { name } }).then(c => c.id)
    const admin = await db.user.create({ data: { name: adminName, email: adminEmail, password: adminPassword, ctfId: id, type: 'admin' } })
    await cookies().then(c => c.set(`ctf-${id}-user`, admin.id))
    redirect(`/${id}`)
}
