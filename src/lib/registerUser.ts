"use server"

import { redirect } from "next/navigation"
import db from "./db"
import { cookies } from "next/headers"

type UserProps = {
    name: string
    email: string
    ctfId: string
    password: string
}

export async function registerUser(data: UserProps) {
    const { name, email, ctfId, password } = data
    if (await db.user.findFirst({ where: { name, ctfId } })) throw new Error("User with the username already exists!")
    if (await db.user.findFirst({ where: { email, ctfId } })) throw new Error("User with the email already exists!")
    
    const id = await db.user.create({ data: { name, email, password, ctfId } }).then(u => u.id)
    await cookies().then(c => c.set(`ctf-${ctfId}-user`, id))
    redirect(`/${ctfId}`)
}