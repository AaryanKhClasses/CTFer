"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar"
import { logoutUser } from "@/lib/userUtils"
import { Layers, LogIn, Settings, User, UserCheck, UserPlus, Users } from "lucide-react"
import { Link } from "@heroui/link"

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
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/login`}><UserCheck className="mr-1.5" />Login</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/register`}><UserPlus className="mr-1.5" />Register</Link></NavbarItem>
            </> : user.type === 'admin' ? <>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/users`}><User className="mr-1.5" />Users</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/teams`}><Users className="mr-1.5" />Teams</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/challenges`}><Layers className="mr-1.5" />Challenges</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/admin/settings`}><Settings className="mr-1.5" />Settings</Link></NavbarItem>
                </> : <>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you`}><User className="mr-1.5" />You</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you/team`}><Users className="mr-1.5" />Your Team</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer"><Link href={`/${id}/you/settings`}><Settings className="mr-1.5" />Settings</Link></NavbarItem>
                <NavbarItem className="text-xl cursor-pointer flex flex-row" onClick={() => logoutUser(id)}><LogIn className="mr-1.5" />Logout</NavbarItem>
            </> }
        </NavbarContent>
    </Navbar>
}