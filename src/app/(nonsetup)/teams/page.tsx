'use client'

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'

type Team = {
    id: number
    name: string
    score: number
    hidden: boolean
    createdAt: Date
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[] | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetch('/api/teams')
        .then(res => res.json())
        .then(setTeams)
        .catch(err => console.error('Error fetching teams:', err))

        fetch('/api/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if(data.user.role === 'ADMIN') setIsAdmin(true)
        })
    }, [])

    const filteredTeams = useMemo(() => {
        if (!filter.trim()) return teams
        return teams?.filter(team => team.name.toLowerCase().includes(filter.toLowerCase()))
    }, [teams, filter])

    const pages = Math.ceil((filteredTeams?.length ?? 0) / rowsPerPage)

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredTeams?.slice(start, end)
    }, [page, filteredTeams])

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Teams</h1>
        <Input type='text' label='Filter by Teamname' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table aria-label="Teams Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No teams found'>
                {items?.map(team => {
                    return !isAdmin && team.hidden ? <></> : <TableRow key={team.id} className={`${team.hidden ? 'text-success' : ''}`}>
                        <TableCell>{team.id}</TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.score}</TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
    </div>
}
