'use client'

import { addToast, Chip, Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Submission = {
    id: number
    username: string
    teamName?: string
    challengeTitle: string
    submitted: string
    correct: boolean
    submittedAt: string
}

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetch('/api/submit')
        .then(res => res.json())
        .then(setSubmissions)
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Internal Server Error',
                description: 'Failed to fetch submissions.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .finally(() => setLoading(false))
    }, [])

    const filteredSubmissions = useMemo(() => {
        if(!filter.trim()) return submissions
        const lowerFilter = filter.toLowerCase()
        return submissions?.filter(submission => 
            submission.challengeTitle.toLowerCase().includes(lowerFilter) ||
            submission.username.toLowerCase().includes(lowerFilter) ||
            submission.teamName?.toLowerCase().includes(lowerFilter)
        )
    }, [submissions, filter])

    const pages = Math.ceil((filteredSubmissions?.length ?? 0) / rowsPerPage)

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredSubmissions?.slice(start, end)
    }, [page, filteredSubmissions])

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Submissions</h1>
        <Input startContent={<Search />} type='text' label='Filter by Challenge, User, or Team.' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table aria-label="Admin Submissions Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>Challenge Title</TableColumn>
                <TableColumn>Username</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Submitted Flag</TableColumn>
                <TableColumn>Correct</TableColumn>
                <TableColumn>Submitted At</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? 'Loading submissions...' : 'No submissions found'}>
                {items?.map(submission => {
                    return <TableRow key={submission.id}>
                        <TableCell>{submission.id}</TableCell>
                        <TableCell>{submission.challengeTitle}</TableCell>
                        <TableCell>{submission.username}</TableCell>
                        <TableCell>{submission.teamName ?? '-'}</TableCell>
                        <TableCell>{submission.submitted}</TableCell>
                        <TableCell>{submission.correct ? <Chip variant='flat' color="success">Correct</Chip> : <Chip variant='flat' color="danger">Incorrect</Chip>}</TableCell>
                        <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
    </div>
}
