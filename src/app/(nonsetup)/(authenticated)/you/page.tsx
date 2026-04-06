'use client'

import { Button, Input, Tab, Tabs, addToast, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { IdCard, KeyRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type TeamData = {
    id: number
    name: string
    score: number
    createdAt: string
    hidden: boolean
    members: { id: number, username: string, score: number }[]
    solves: { id: number, title: string, points: number, solvedAt: string }[]
    stats: {
        totalSubmissions: number
        correctSubmissions: number
        wrongSubmissions: number
        correctPercentage: number
        wrongPercentage: number
    }
}

type FormState = {
    action: 'create' | 'join'
    teamName: string
    teamPassword: string
}

export default function YourTeamPage() {
    const [hasTeam, setHasTeam] = useState<boolean | null>(null)
    const [teamData, setTeamData] = useState<TeamData | null>(null)
    const [loading, setLoading] = useState(true)
    const [formState, setFormState] = useState<FormState>({
        action: 'join',
        teamName: '',
        teamPassword: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetch('/api/teams/my-team')
            .then(res => res.json())
            .then(data => {
                setHasTeam(data.hasTeam)
                if(data.hasTeam) setTeamData(data.team)
            })
            .catch(err => {
                console.error(err)
                addToast({
                    title: 'Error',
                    description: 'Failed to load team data.',
                    color: 'danger',
                    shouldShowTimeoutProgress: true,
                    timeout: 5000,
                })
            })
            .finally(() => setLoading(false))
    }, [])

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: formState.action,
                    teamName: formState.teamName,
                    teamPassword: formState.teamPassword
                })
            })

            const data = await response.json()
            if(!response.ok) return addToast({
                title: 'Error',
                description: data.error || 'Failed to process team action.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })

            addToast({
                title: 'Success',
                description: `${formState.action === 'create' ? 'Team created' : 'Team joined'} successfully!`,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })

            const teamRes = await fetch('/api/teams/my-team')
            const teamRes_data = await teamRes.json()
            setHasTeam(teamRes_data.hasTeam)
            if(teamRes_data.hasTeam) setTeamData(teamRes_data.team)
            setFormState({ action: 'join', teamName: '', teamPassword: '' })
        } catch (err) {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'An error occurred. Please try again.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const scoreProgressionData = useMemo(() => {
        if(!teamData?.solves || teamData.solves.length === 0) return []

        const sortedSolves = [...teamData.solves].sort((a, b) => 
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
    }, [teamData?.solves])

    if(!hasTeam) {
        return <div className='flex flex-col items-center p-5 h-screen'>
            <h1 className='text-4xl font-bold mb-[5vh]'>Your Team</h1>
            <Card className='w-full max-w-md'>
                <CardHeader className='flex flex-col items-start px-4 py-3'>
                    <h2 className='text-xl font-bold'>Join or Create a Team</h2>
                </CardHeader>
                <Divider />
                <CardBody className='gap-4'>
                    <Tabs fullWidth selectedKey={formState.action} onSelectionChange={(key) => setFormState(prev => ({ ...prev, action: key as 'create' | 'join' }))}>
                        <Tab key="join" title="Join Team">
                            <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
                                <Input startContent={<IdCard />} label='Team Name' labelPlacement='outside' placeholder='Enter Team Name' value={formState.teamName} onValueChange={(value) => setFormState(prev => ({ ...prev, teamName: value }))} isDisabled={submitting} />
                                <Input startContent={<KeyRound />} label='Team Password' type='password' labelPlacement='outside' placeholder='Enter Team Password' value={formState.teamPassword} onValueChange={(value) => setFormState(prev => ({ ...prev, teamPassword: value }))} isDisabled={submitting} />
                                <Button type='submit' color='default' variant='flat' isLoading={submitting} isDisabled={!formState.teamName.trim()}>Join Team</Button>
                            </form>
                        </Tab>
                        <Tab key="create" title="Create Team">
                            <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
                                <Input startContent={<IdCard />} label='Team Name' labelPlacement='outside' placeholder='Set Team Name' value={formState.teamName} onValueChange={(value) => setFormState(prev => ({ ...prev, teamName: value }))} isDisabled={submitting} />
                                <Input startContent={<KeyRound />} label='Team Password' type='password' labelPlacement='outside' placeholder='Set Team Password' value={formState.teamPassword} onValueChange={(value) => setFormState(prev => ({ ...prev, teamPassword: value }))} isDisabled={submitting} />
                                <Button type='submit' color='default' variant='flat' isLoading={submitting} isDisabled={!formState.teamName.trim()}>Create Team</Button>
                            </form>
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    }

    return <div className='flex flex-col items-center p-5'>
        <h1 className='text-4xl font-bold mb-10'>Your Team</h1>
        <Card className='w-full mb-6'>
            <CardHeader className='flex flex-col items-start gap-2'>
                <h2 className='text-3xl font-bold'>{teamData?.name}</h2>
                <p className='text-gray-400'>Team Score: {teamData?.score} pts</p>
            </CardHeader>
        </Card>

        <Card className='w-full mb-6'>
            <CardHeader className='text-lg font-bold'>Score Progression</CardHeader>
            <Divider />
            <CardBody>
                {loading && <p className='text-gray-400'>Loading score data...</p>}
                {!loading && scoreProgressionData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scoreProgressionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="time" stroke="#999" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1d1f1f', border: '1px solid #444' }} labelStyle={{ color: '#fff' }} formatter={(value) => [`${value} pts`, 'Score']} />
                        <Line type="monotone" dataKey="score" stroke="#10b981" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} />
                    </LineChart>
                </ResponsiveContainer> : <p className='text-gray-400'>No score data available yet.</p>}
            </CardBody>
        </Card>

        <Card className='w-full mb-6'>
            <CardHeader className='text-lg font-bold'>Team Members ({teamData?.members.length})</CardHeader>
            <Divider />
            <CardBody className='gap-2 max-h-60 overflow-y-auto'>
                {loading && <p className='text-gray-400'>Loading team members...</p>}
                {!loading && teamData?.members && teamData.members.length > 0 ? teamData.members.map((member) => (
                    <Button color='default' variant='flat' key={member.id} className='flex flex-row justify-between items-center'>
                        <span className='font-semibold'>{member.username}</span>
                        <span className='text-gray-300'>{member.score} pts</span>
                    </Button>
                    )) : <p className='text-gray-400'>No team members.</p>
                }
            </CardBody>
        </Card>

        <Card className='w-full mb-6'>
            <CardHeader className='text-lg font-bold'>Solved Challenges ({teamData?.solves.length})</CardHeader>
            <Divider />
            <CardBody className='gap-2 max-h-60 overflow-y-auto'>
                {loading && <p className='text-gray-400'>Loading solved challenges...</p>}
                {!loading && teamData?.solves && teamData.solves.length > 0 ? teamData.solves.map((solve) => (
                    <Button color='default' variant='flat' key={solve.id} className='flex flex-row justify-between items-center'>
                        <span className='font-semibold text-sm'>{solve.title}</span>
                        <span className='text-gray-300 text-sm'>{solve.points} pts</span>
                    </Button>
                    )) : <p className='text-gray-400'>No solved challenges yet.</p>
                }
            </CardBody>
        </Card>

        <Card className='w-full mb-6'>
            <CardHeader className='text-lg font-bold'>Submission Statistics</CardHeader>
            <Divider />
            <CardBody className='gap-4'>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>Total Submissions:</span>
                    <span className='font-semibold'>{teamData?.stats.totalSubmissions}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-success'>Correct Submissions:</span>
                    <span className='font-semibold'>{teamData?.stats.correctSubmissions} ({teamData?.stats.correctPercentage}%)</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-danger'>Wrong Submissions:</span>
                    <span className='font-semibold'>{teamData?.stats.wrongSubmissions} ({teamData?.stats.wrongPercentage}%)</span>
                </div>
            </CardBody>
        </Card>
    </div>
}
