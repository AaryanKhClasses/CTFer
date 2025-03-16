"use server"

import { redirect } from "next/navigation"
import db from "./db"
import { cookies } from "next/headers"

type RegisterUserProps = {
    name: string
    email: string
    ctfId: string
    password: string
}

type LoginUserProps = {
    email: string
    password: string
    ctfId: string
}

export async function registerUser(data: RegisterUserProps) {
    const { name, email, ctfId, password } = data
    if (await db.user.findFirst({ where: { name, ctfId } })) throw new Error("User with the username already exists!")
    if (await db.user.findFirst({ where: { email, ctfId } })) throw new Error("User with the email already exists!")
    
    const id = await db.user.create({ data: { name, email, password, ctfId } }).then(u => u.id)
    await cookies().then(c => c.set(`ctf-${ctfId}-user`, id))
    redirect(`/${ctfId}`)
}

export async function loginUser(data: LoginUserProps) {
    const { email, password, ctfId } = data
    const user = await db.user.findFirst({ where: { email, ctfId } })
    if (!user) throw new Error("User not found!")
    if (user.password !== password) throw new Error("Invalid password!")
    await cookies().then(c => c.set(`ctf-${ctfId}-user`, user.id))
    redirect(`/${ctfId}`)
}

export async function logoutUser(ctfId: string) {
    await cookies().then(c => c.delete(`ctf-${ctfId}-user`))
    redirect(`/${ctfId}`)
}