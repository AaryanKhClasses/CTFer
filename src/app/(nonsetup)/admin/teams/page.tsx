'use client'

import { addToast, Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@heroui/react'
import { Eye, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Team = {
    id: number
    name: string
    score: number
    hidden: boolean
    createdAt: Date
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetch('/api/teams')
        .then(res => res.json())
        .then(setTeams)
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Internal Server Error',
                description: 'Failed to fetch teams.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .finally(() => setLoading(false))
    }, [])

    const filteredTeams = useMemo(() => {
        if(!filter.trim()) return teams
        return teams?.filter(team => team.name.toLowerCase().includes(filter.toLowerCase()))
    }, [teams, filter])

    const pages = Math.ceil((filteredTeams?.length ?? 0) / rowsPerPage)

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredTeams?.slice(start, end)
    }, [page, filteredTeams])

    const handleToggleTeam = (id: number) => {
        fetch(`/api/teams/${id}`, { method: 'PATCH' })
        .then(res => res.json())
        .then(updatedTeam => {
            setTeams(prevTeams => {
                if(!prevTeams) return prevTeams
                return prevTeams.map(team => team.id === updatedTeam.id ? updatedTeam : team)
            })
            addToast({
                title: 'Toggle Team Visibility',
                description: `Team ${updatedTeam.name} is now ${updatedTeam.hidden ? 'hidden' : 'visible'}.`,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'Failed to toggle team visibility.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Teams</h1>
        <Input startContent={<Search />} type='text' label='Filter by Teamname' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table aria-label="Admin Teams Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? 'Loading teams...' : 'No teams found'}>
                {items?.map(team => {
                    return <TableRow key={team.id} className={`${team.hidden ? 'text-success' : ''}`}>
                        <TableCell>{team.id}</TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.score}</TableCell>
                        <TableCell>
                            <Tooltip color="foreground" closeDelay={0} content="Toggle Visibility"><Eye className='text-foreground cursor-pointer' onClick={() => handleToggleTeam(team.id)} /></Tooltip>
                        </TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
    </div>
}
