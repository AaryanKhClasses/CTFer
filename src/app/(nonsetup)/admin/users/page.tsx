'use client'

import { addToast, Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@heroui/react'
import { Eye, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type User = {
    id: number
    role: 'ADMIN' | 'PLAYER'
    username: string
    score: number
    hidden: boolean
    active: boolean
    teamID: number | null
    teamName: string | null
    createdAt: Date
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[] | null>(null)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetch('/api/users')
        .then(res => res.json())
        .then(setUsers)
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Internal Server Error',
                description: 'Failed to fetch users.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }, [])

    const filteredUsers = useMemo(() => {
        if (!filter.trim()) return users
        return users?.filter(user => user.username.toLowerCase().includes(filter.toLowerCase()))
    }, [users, filter])

    const pages = Math.ceil((filteredUsers?.length ?? 0) / rowsPerPage)

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredUsers?.slice(start, end)
    }, [page, filteredUsers])

    const handleToggleUser = (id: number) => {
        fetch(`/api/users/${id}`, { method: 'PATCH' })
        .then(res => res.json())
        .then(updatedUser => {
            setUsers(prevUsers => {
                if (!prevUsers) return prevUsers
                return prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
            })
            addToast({
                title: 'Toggle User Visibility',
                description: `User ${updatedUser.username} is now ${updatedUser.hidden ? 'hidden' : 'visible'}.`,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'Failed to toggle user visibility.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }

    const handleDeleteUser = (id: number) => {
        fetch(`/api/users/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(updatedUser => {
            setUsers(prevUsers => {
                if (!prevUsers) return prevUsers
                return prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
            })
            addToast({
                title: 'Delete User',
                description: `User ${updatedUser.username} has been deactivated.`,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'Failed to delete user.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Users</h1>
        <Input startContent={<Search />} type='text' label='Filter by Username' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table aria-label="Admin Users Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>User Name</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No users found'>
                {items?.map(user => {
                    return <TableRow key={user.id} className={`${!user.active ? 'text-danger' : user.hidden ? 'text-success' : ''}`}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.teamName ?? '-'}</TableCell>
                        <TableCell>{user.score}</TableCell>
                        <TableCell className='flex flex-row'>
                            <Tooltip color="foreground" closeDelay={0} content="Toggle Visibility"><Eye className='text-foreground cursor-pointer' onClick={() => handleToggleUser(user.id)} /></Tooltip>
                            <Tooltip color='danger' closeDelay={0} content="Delete User"><Trash2 className='text-danger cursor-pointer' onClick={() => handleDeleteUser(user.id)} /></Tooltip>
                        </TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
    </div>
}
