import db from "@/lib/db"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar"
import { Link } from "@heroui/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

export default async function CTFLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{id: string}> }>) {
    const id = (await params).id
    const ctf = await db.cTF.findUnique({ where: { id } })
    if(!ctf) return notFound()

    const cookie = await cookies()
    const userCookie = cookie.get(`ctf-${id}-user`)?.value
    let user = null
    if(userCookie) user = await db.user.findUnique({ where: { id: userCookie, ctfId: id } })

    return <>
        <h1 className="text-[2rem] text-center">{ctf.name}</h1>

        <Navbar position="static" className="flex">
            <NavbarContent className="gap-4 flex items-center mx-5" justify="center">
                <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/users`}>Users</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/teams`}>Teams</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/scorecard`}>Scorecard</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/challenges`}>Challenges</Link></NavbarItem>
            </NavbarContent>
            <NavbarContent className="gap-4 flex items-center" justify="end">
                {!user ? <>
                    <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/login`}>Login</Link></NavbarItem>
                    <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/register`}>Register</Link></NavbarItem>
                </> : <>
                    {/* <NavbarItem className="text-xl cursor-pointer">Notifications</NavbarItem> */}
                    <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/you`}>You</Link></NavbarItem>
                    <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/you/team`}>Your Team</Link></NavbarItem>
                    <NavbarItem className="text-xl cursor-pointer"><Link href={`${id}/you/settings`}>Settings</Link></NavbarItem>
                    <NavbarItem className="text-xl cursor-pointer">Logout</NavbarItem>
                </>}
            </NavbarContent>
        </Navbar>
        <div className="my-6 px-3 flex flex-col min-h-screen">
            <div className="flex-grow">{children}</div>
        </div>
    </>
}