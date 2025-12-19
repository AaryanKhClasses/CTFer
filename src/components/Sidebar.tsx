'use client'

import { Bell, ChartArea, CircleUserRound, LogIn, LogOut, Settings, SquareUserRound, Swords, Users, Wrench } from 'lucide-react'
import { Divider, Tooltip } from '@heroui/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

type Me = {
    authenticated: boolean,
    user?: {
        id: string,
        role: string
    }
}

export default function Sidebar() {
    const [auth, setAuth] = useState<Me | null>(null)
    useEffect(() => {
        fetch('/api/me', { credentials: 'include' })
        .then(res => res.json())
        .then(setAuth)
        .catch(() => setAuth({ authenticated: false }))
    }, [])

    return <div className='flex flex-col items-center justify-between fixed fixed-top left-0 top-0 w-20 h-screen bg-[#1d1f1f] p-3 pt-5 z-5'>
        <div className='flex flex-col gap-6 items-center'>
            <h1 className='text-xl font-semibold cursor-pointer' onClick={() => redirect('/')}>CTFer</h1>
            <Divider />
            <Tooltip color='foreground' closeDelay={0} content='Users' placement='right'><CircleUserRound className='cursor-pointer' onClick={() => redirect('/users')} /></Tooltip>
            <Tooltip color='foreground' closeDelay={0} content='Teams' placement='right'><Users className='cursor-pointer' onClick={() => redirect('/teams')} /></Tooltip>
            <Tooltip color='foreground' closeDelay={0} content='Scoreboard' placement='right'><ChartArea className='cursor-pointer' onClick={() => redirect('/scoreboard')} /></Tooltip>
            <Tooltip color='foreground' closeDelay={0} content='Challenges' placement='right'><Swords className='cursor-pointer' onClick={() => redirect('/challenges')} /></Tooltip>
            <Divider />
            {auth?.user?.role === 'ADMIN' && <Tooltip color='foreground' closeDelay={0} content='Admin Section' placement='right'><Wrench className='cursor-pointer' onClick={() => redirect('/admin/users')} /></Tooltip>}
            <Tooltip color='foreground' closeDelay={0} content='Notifications' placement='right'><Bell className='cursor-pointer' onClick={() => redirect('/notifications')} /></Tooltip>
            {auth?.authenticated && <Tooltip color='foreground' closeDelay={0} content='Your Team' placement='right'><SquareUserRound className='cursor-pointer' onClick={() => redirect('/you')} /></Tooltip>}
        </div>
        <div className='flex flex-col gap-6 items-center'>
            <Divider />
            <Tooltip color='foreground' closeDelay={0} content='Settings' placement='right'><Settings className='cursor-pointer' onClick={() => redirect('/settings')} /></Tooltip>
            {auth?.authenticated ?
                <Tooltip color='foreground' closeDelay={0} content='Logout' placement='right'><LogOut className='cursor-pointer' onClick={() => fetch('/api/logout', { credentials: 'include', method: 'POST' })} /></Tooltip> :
                <Tooltip color='foreground' closeDelay={0} content='Login' placement='right'><LogIn className='cursor-pointer' onClick={() => redirect('/login')} /></Tooltip>
            }
        </div>
    </div>
}
