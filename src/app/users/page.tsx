'use client'

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'

type User = {
    id: number
    role: 'ADMIN' | 'PLAYER'
    username: string
    score: number
    hidden: boolean
    active: boolean
    teams: string[]
    createdAt: Date
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[] | null>(null)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetch('/api/users')
        .then(res => res.json())
        .then(setUsers)
        .catch(err => console.error('Error fetching users:', err))
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

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Users</h1>
        <Input type='text' label='Filter by Username' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table>
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>User Name</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No users found'>
                {items?.map(user => {
                    return <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.teams ?? '-'}</TableCell>
                        <TableCell>{user.score}</TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
    </div>
}
