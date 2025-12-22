'use client'

import { addToast, Button, Divider, Input, Tab, Tabs } from '@heroui/react'
import { LandPlot } from 'lucide-react'
import Markdown from 'markdown-to-jsx/react'
import { useEffect, useMemo, useState } from 'react'

type Challenge = {
    id: number
    title: string
    description: string
    category: string
    points: number
    type: string
    tags: string[]
    createdAt: Date
    hints?: { cost: number }[]
    solved?: boolean
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
    const [submittedFlag, setSubmittedFlag] = useState('')
    const sortedChallenges = useMemo(() => Array.isArray(challenges) ? [...challenges].sort((a, b) => a.category.localeCompare(b.category)) : [], [challenges])
    const categories = useMemo(() => Array.from(new Set(sortedChallenges.map((c) => c.category))), [sortedChallenges])

    useEffect(() => {
        fetch('/api/challenges')
        .then((res) => res.json())
        .then(setChallenges)
        .catch((err) => {
            console.error(err)
            addToast({
                title: 'Internal Server Error',
                description: 'Could not fetch challenges',
                color: 'danger',
                timeout: 5000,
                shouldShowTimeoutProgress: true
            })
        })
    }, [])

    const handleFlagSubmit = () => {
        fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId: selectedChallenge?.id, flag: submittedFlag })
        })
        .then((res) => res.json())
        .then((data) => {
            if(data.success) {
                addToast({
                    title: 'Flag Submitted',
                    description: 'Your flag was submitted successfully.',
                    color: 'success',
                    timeout: 5000,
                    shouldShowTimeoutProgress: true
                })
            } else {
                addToast({
                    title: 'Submission Failed',
                    description: data.message || 'There was an error submitting your flag.',
                    color: 'danger',
                    timeout: 5000,
                    shouldShowTimeoutProgress: true
                })
            }
        })
        .catch(() => {
            addToast({
                title: 'Internal Server Error',
                description: 'Could not submit flag',
                color: 'danger',
                timeout: 5000,
                shouldShowTimeoutProgress: true
            })
        })
    }

    return <div className="flex flex-row items-center w-full *:min-h-screen">
        <div className="flex flex-col bg-[#2d2e2e] w-1/4 p-5 rounded-tr-lg">
            <h1 className='text-2xl font-bold mb-5'>Challenges</h1>
            <Divider />
            {categories.map((category) => (
                <div key={category}>
                    <h2 className="text-lg font-bold my-2">{category}</h2>
                    <div className="space-y-3">
                        {sortedChallenges.filter((c) => c.category === category).map((challenge) => (
                            <Button key={challenge.id} fullWidth variant='flat' color={challenge.solved ? 'success' : 'default'} className='flex flex-row gap-3 items-center p-3 justify-between' onPress={() => setSelectedChallenge(challenge)}>
                                <span className="font-semibold">{challenge.title}</span>
                                <span className="font-semibold text-gray-300">{challenge.points} pts</span>
                            </Button>
                        ))}
                    </div>
                    <Divider className="my-3" />
                </div>
            ))}
        </div>
        <div className="flex flex-col w-3/4">
            {challenges.length === 0 && <p className="h-screen flex items-center justify-center text-3xl text-gray-300">No challenges available.</p>}
            {!selectedChallenge && challenges.length > 0 && <p className="h-screen flex items-center justify-center text-3xl text-gray-300">Select a challenge to view details.</p>}
            {selectedChallenge && <div className="flex flex-col *:p-5 w-full min-h-screen justify-between">
                <div className="flex flex-col items-start justify-start">
                    <h1 className="text-4xl font-bold underline-offset-3 underline">{selectedChallenge.title}</h1>
                    <p className="text-gray-300 text-2xl">{selectedChallenge.category}</p>
                    <p className="text-gray-300 text-xl">{selectedChallenge.points}<span className="font-semibold">pts</span></p>
                    <Divider className="my-5 w-full" />
                    <Markdown className="text-gray-200 text-md flex flex-col gap-3 [&_a]:text-blue-400">{selectedChallenge.description}</Markdown>
                </div>
                <div className="flex flex-col bg-[#1d1f1f] rounded-t-lg">
                    <Tabs fullWidth>
                        <Tab key="Flag" title="Flag" className="p-5">
                            <h2 className="text-2xl font-bold mb-3">Enter Flag</h2>
                            <div className="flex flex-row gap-2">
                                <Input startContent={<LandPlot />} placeholder="Enter your flag here" value={submittedFlag} onValueChange={setSubmittedFlag} />
                                <Button color='default' variant='flat' onPress={handleFlagSubmit}>Submit Flag</Button>
                            </div>
                        </Tab>
                        <Tab key="Hints" title="Hints">
                            <h2 className="text-2xl font-bold mb-3">Hints</h2>
                            <p className="text-gray-300">{selectedChallenge.hints?.length === 0 ? 'No hints are available for this challenge.' :
                                selectedChallenge.hints?.map((h, idx) => <Button key={idx} fullWidth variant='flat' color='default'>Unlock Hint for {h.cost} pts</Button>)
                            }</p>
                        </Tab>
                        <Tab key="Attachments" title="Attachments">
                            <h2 className="text-2xl font-bold mb-3">Attachments</h2>
                            <p className="text-gray-300">No attachments available for this challenge.</p>
                        </Tab>
                    </Tabs>
                </div>
            </div>}
        </div>
    </div>
}
