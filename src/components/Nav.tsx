"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar"
import { Link } from "@heroui/link"
import { logoutUser } from "@/lib/userUtils"

export default function Nav({ id, user }: { id: string, user: any }) {
    return <Navbar position="static" className="flex">
        <NavbarContent className="gap-4 flex items-center mx-5" justify="center">
            <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/users`}>Users</Link></NavbarItem>
            <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/teams`}>Teams</Link></NavbarItem>
            <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/scorecard`}>Scorecard</Link></NavbarItem>
            <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/challenges`}>Challenges</Link></NavbarItem>
        </NavbarContent>
        <NavbarContent className="gap-4 flex items-center" justify="end">
            {!user ? <>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/login`}>Login</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/register`}>Register</Link></NavbarItem>
            </> : user.type === 'admin' ? <>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/users`}>Users</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/teams`}>Teams</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/challenges`}>Challenges</Link></NavbarItem>
            </> : <>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you`}>You</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you/team`}>Your Team</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you/settings`}>Settings</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer" onClick={() => logoutUser(id)}>Logout</NavbarItem>
            </> }
        </NavbarContent>
    </Navbar>
}