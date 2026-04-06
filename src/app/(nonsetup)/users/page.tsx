'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, addToast, useDisclosure } from '@heroui/react'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type User = {
    id: number
    role: 'ADMIN' | 'PLAYER'
    username: string
    score: number
    hidden: boolean
    active: boolean
    teamID: number | null
    teamName: string | null
    solves?: {
        id: number
        title: string
        points: number
        solvedAt: Date
    }[]
    createdAt: Date
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[] | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')
    const modal = useDisclosure()
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userDetails, setUserDetails] = useState<User | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loading, setLoading] = useState(true)

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
        .finally(() => setLoading(false))

        fetch('/api/me')
        .then(res => res.json())
        .then(data => {
            if(data.user && data.user.role === 'ADMIN') setIsAdmin(true)
        })
    }, [])

    const filteredUsers = useMemo(() => {
        if(!filter.trim()) return users
        return users?.filter(user => user.username.toLowerCase().includes(filter.toLowerCase()))
    }, [users, filter])

    const pages = Math.ceil((filteredUsers?.length ?? 0) / rowsPerPage)

    const handleUserClick = (userId: number) => {
        setLoadingDetails(true)
        fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
            setUserDetails(data)
            modal.onOpen()
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'Failed to fetch user details.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .finally(() => setLoadingDetails(false))
    }

    const scoreProgressionData = useMemo(() => {
        if(!userDetails?.solves || userDetails.solves.length === 0) return []
        
        const sortedSolves = [...userDetails.solves].sort((a, b) => 
            new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime()
        )
        
        let cumulativeScore = 0
        return sortedSolves.map((solve) => {
            cumulativeScore += solve.points
            return {
                time: new Date(solve.solvedAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
                score: cumulativeScore,
                challenge: solve.title
            }
        })
    }, [userDetails?.solves])

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredUsers?.slice(start, end)
    }, [page, filteredUsers])

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Users</h1>
        <Input startContent={<Search />} type='text' label='Filter by Username' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
        <Table aria-label="Users Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>User Name</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? 'Loading users...' : 'No users found'}>
                {items?.map(user => {
                    return !isAdmin && user.hidden ? <></> : <TableRow key={user.id} className={`${user.role === 'ADMIN' ? 'text-danger' : user.hidden ? 'text-success' : ''}`}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className='cursor-pointer' onClick={() => { setCurrentUser(user); handleUserClick(user.id) }}>{user.username}</TableCell>
                        <TableCell>{user.teamName ?? '-'}</TableCell>
                        <TableCell>{user.score}</TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
        <Modal isOpen={modal.isOpen} onClose={() => { modal.onClose(); setUserDetails(null) }} onOpenChange={modal.onOpenChange} size="4xl">
            <ModalContent>
                <ModalHeader>User Details</ModalHeader>
                <ModalBody className='flex flex-row gap-2 w-full'>
                    <div className="flex flex-col w-1/2">
                        <h1 className='text-xl font-bold pb-2'>{userDetails?.username || currentUser?.username}</h1>
                        {userDetails?.teamName ? <h1 className='text-lg text-gray-300 font-semibold'>{userDetails?.teamName}</h1> : null}
                        <h1 className='text-md text-gray-300'>Points: {userDetails?.score || currentUser?.score}</h1>
                        <p className='text-sm text-gray-400 pt-2'>Joined: {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
                        <div className='pt-4 w-full'>
                            <h3 className='text-lg font-bold pb-3'>Score Progression</h3>
                            {scoreProgressionData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={scoreProgressionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="time" stroke="#999" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1d1f1f', border: '1px solid #444' }} labelStyle={{ color: '#fff' }} formatter={(value) => [`${value} pts`, 'Score']} />
                                    <Line type="monotone" dataKey="score" stroke="#10b981" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} />
                                </LineChart>
                            </ResponsiveContainer> : <p className='text-gray-400'>No score data available.</p>}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <h2 className='text-xl font-bold pb-2'>Solved Challenges ({userDetails?.solves?.length || 0})</h2>
                        <div className="flex flex-col overflow-y-auto gap-2 max-h-96">
                            {loadingDetails ? <p className='text-gray-400'>Loading...</p> : userDetails?.solves && userDetails.solves.length > 0 ? 
                                userDetails.solves.map((solve) => <Button key={solve.id} fullWidth variant='flat' color='default' className='flex flex-row gap-3 items-center p-3 justify-between'>
                                    <span className="font-semibold">{solve.title}</span>
                                    <span className="font-semibold text-gray-300">{solve.points} pts</span>
                                </Button>)
                            : <p className='text-gray-400'>No solved challenges yet.</p>}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant='flat' onPress={() => { modal.onClose(); setUserDetails(null) }}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </div>
}
