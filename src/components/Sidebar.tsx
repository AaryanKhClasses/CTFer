'use client'

import { Divider, Tooltip } from '@heroui/react'
import { Bell, ChartArea, CircleUserRound, LogIn, LogOut, Route, Settings, SquareUserRound, Swords, Undo2, Users, Wrench } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type Role = 'PLAYER' | 'ADMIN'
type Team = { id: number, name: string } | null
type Me =
    | { authenticated: false }
    | {
            authenticated: true
            user: {
                id: string
                username: string
                email: string | null
                role: Role
                score: number
                active: boolean
                team: Team
            }
        }

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [auth, setAuth] = useState<Me>({ authenticated: false })
    const currentAdmin = useMemo(() => auth?.authenticated && auth?.user?.role === 'ADMIN' && pathname.startsWith('/admin'), [auth, pathname])
    
    useEffect(() => {
        fetch('/api/me')
        .then(res => res.json())
        .then(setAuth)
        .catch(() => setAuth({ authenticated: false }))
    }, [])

    const handleLogOut = () => {
        fetch('/api/logout', { method: 'POST' })
        window.location.reload()
    }

    return <div className='flex flex-col items-center justify-between fixed fixed-top left-0 top-0 w-20 h-screen bg-[#1d1f1f] p-3 pt-5 z-5'>
        <div className='flex flex-col gap-6 items-center'>
            <h1 className='text-xl font-semibold cursor-pointer' onClick={() => router.push('/')}>CTFer</h1>
            <Divider />
            <Tooltip color='foreground' closeDelay={0} content='Users' placement='right'><CircleUserRound className='cursor-pointer' onClick={() => { router.push(currentAdmin ? '/admin/users' : '/users') }} /></Tooltip>
            <Tooltip color='foreground' closeDelay={0} content='Teams' placement='right'><Users className='cursor-pointer' onClick={() => router.push(currentAdmin ? '/admin/teams' : '/teams')} /></Tooltip>
            {currentAdmin ? <Tooltip color='foreground' closeDelay={0} content='Submissions' placement='right'><Route className='cursor-pointer' onClick={() => router.push('/admin/submissions')} /></Tooltip>
                : <Tooltip color='foreground' closeDelay={0} content='Scoreboard' placement='right'><ChartArea className='cursor-pointer' onClick={() => router.push('/scoreboard')} /></Tooltip>}
            <Tooltip color='foreground' closeDelay={0} content='Challenges' placement='right'><Swords className='cursor-pointer' onClick={() => router.push(currentAdmin ? '/admin/challenges' : '/challenges')} /></Tooltip>
            <Divider />
            {auth?.authenticated && auth?.user?.role === 'ADMIN' && <Tooltip color='foreground' closeDelay={0} content={`${currentAdmin ? 'User Mode' : 'Admin Mode'}`} placement='right'>
                {currentAdmin ? <Undo2 className='cursor-pointer' onClick={() => router.push(pathname.replace('/admin', ''))} /> :
                <Wrench className='cursor-pointer' onClick={() => router.push('/admin' + pathname)} />}
            </Tooltip>}
            <Tooltip color='foreground' closeDelay={0} content='Notifications' placement='right'><Bell className='cursor-pointer' onClick={() => router.push('/notifications')} /></Tooltip>
            {auth?.authenticated && <Tooltip color='foreground' closeDelay={0} content='Your Team' placement='right'><SquareUserRound className='cursor-pointer' onClick={() => router.push('/you')} /></Tooltip>}
        </div>
        <div className='flex flex-col gap-6 items-center'>
            <Divider />
            <Tooltip color='foreground' closeDelay={0} content='Settings' placement='right'><Settings className='cursor-pointer' onClick={() => router.push('/settings')} /></Tooltip>
            {auth?.authenticated ?
                <Tooltip color='danger' closeDelay={0} content='Logout' placement='right'><LogOut className='cursor-pointer text-danger' onClick={handleLogOut} /></Tooltip> :
                <Tooltip color='foreground' closeDelay={0} content='Login' placement='right'><LogIn className='cursor-pointer' onClick={() => router.push('/login')} /></Tooltip>
            }
        </div>
    </div>
}
