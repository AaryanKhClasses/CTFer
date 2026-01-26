'use client'

import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Pagination, Select, SelectItem, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Textarea, Tooltip, useDisclosure } from '@heroui/react'
import { ChartColumnStacked, Eye, Hash, IdCard, LandPlot, Layers, Lightbulb, Pen, Plus, ScrollText, Search, Section, Tag, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Challenge = {
    id: number
    title: string
    description: string
    category: string
    points: number
    type: string
    hidden: boolean
    flags: { content: string, type: 'CASE_INSENSITIVE' | 'CASE_SENSITIVE' }[]
    hints: { content: string, cost: number }[]
    files: string[]
    tags: string[]
    state: 'VISIBLE' | 'HIDDEN'
    createdAt: Date
}

export default function AdminChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const rowsPerPage = 10
    const [filter, setFilter] = useState('')

    const [challengeName, setChallengeName] = useState('')
    const [challengeDescription, setChallengeDescription] = useState('')
    const [challengeCategory, setChallengeCategory] = useState('')
    const [challengePoints, setChallengePoints] = useState(0)
    const [challengeMaxAttempts, setChallengeMaxAttempts] = useState(0)
    const [challengeType, setChallengeType] = useState('')
    const [challengeState, setChallengeState] = useState<'VISIBLE' | 'HIDDEN'>('VISIBLE')
    const [challengeFlags, setChallengeFlags] = useState<{ content: string, type: 'CASE_INSENSITIVE' | 'CASE_SENSITIVE' }[]>([])
    const [challengeHints, setChallengeHints] = useState<{ content: string, cost: number }[]>([])
    const [challengeFiles, setChallengeFiles] = useState<string[]>([])
    const [challengeTags, setChallengeTags] = useState<string[]>([])
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
    const modal = useDisclosure()
    const flagsModal = useDisclosure()
    const hintsModal = useDisclosure()

    useEffect(() => {
        fetch('/api/challenges')
        .then(res => res.json())
        .then(setChallenges)
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Internal Server Error',
                description: 'Failed to fetch challenges.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .finally(() => setLoading(false))
    }, [])

    const filteredChallenges = useMemo(() => {
        if(!filter.trim()) return challenges
        return challenges?.filter(challenge => challenge.title.toLowerCase().includes(filter.toLowerCase()))
    }, [challenges, filter])

    const pages = Math.ceil((filteredChallenges?.length ?? 0) / rowsPerPage)

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredChallenges?.slice(start, end)
    }, [page, filteredChallenges])

    const handleCreateChallenge = () => {
        const challengeData = {
            title: challengeName,
            description: challengeDescription,
            category: challengeCategory,
            type: challengeType,
            points: challengePoints,
            state: challengeState,
            flags: challengeFlags,
            hints: challengeHints,
            files: challengeFiles,
            tags: challengeTags
        }

        const isEditing = editingChallenge !== null
        const url = isEditing ? `/api/challenges/${editingChallenge.id}` : '/api/challenges'
        const method = isEditing ? 'PATCH' : 'POST'

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(challengeData),
        })
        .then(res => res.json())
        .then(savedChallenge => {
            if(isEditing) {
                setChallenges(prev => prev ? prev.map(c => c.id === savedChallenge.id ? savedChallenge : c) : [savedChallenge])
                addToast({
                    title: 'Challenge Updated',
                    description: `Challenge ${savedChallenge.title} has been updated successfully.`,
                    color: 'success',
                    shouldShowTimeoutProgress: true,
                    timeout: 5000,
                })
            } else {
                setChallenges(prev => prev ? [savedChallenge, ...prev] : [savedChallenge])
                addToast({
                    title: 'Challenge Created',
                    description: `Challenge ${savedChallenge.title} has been created successfully.`,
                    color: 'success',
                    shouldShowTimeoutProgress: true,
                    timeout: 5000,
                })
            }
            resetForm()
            modal.onClose()
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: `Failed to ${isEditing ? 'update' : 'create'} challenge.`,
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }

    const handleEditChallenge = (challenge: Challenge) => {
        setEditingChallenge(challenge)
        setChallengeName(challenge.title)
        setChallengeDescription(challenge.description)
        setChallengeCategory(challenge.category)
        setChallengePoints(challenge.points)
        setChallengeType(challenge.type)
        setChallengeState(challenge.state)
        setChallengeFlags(challenge.flags)
        setChallengeHints(challenge.hints)
        setChallengeTags(challenge.tags)
        modal.onOpen()
    }

    const handleDeleteChallenge = (id: number, title: string) => {
        fetch(`/api/challenges/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            setChallenges(prev => prev ? prev.filter(c => c.id !== id) : null)
            addToast({
                title: 'Challenge Deleted',
                description: `Challenge "${title}" has been deleted successfully.`,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
        .catch(err => {
            console.error(err)
            addToast({
                title: 'Error',
                description: 'Failed to delete challenge.',
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
        })
    }

    const resetForm = () => {
        setEditingChallenge(null)
        setChallengeName('')
        setChallengeDescription('')
        setChallengeCategory('')
        setChallengePoints(0)
        setChallengeType('')
        setChallengeState('VISIBLE')
        setChallengeFlags([])
        setChallengeHints([])
        setChallengeFiles([])
        setChallengeTags([])
    }

    return <div className='flex flex-col items-center p-5 h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Challenges</h1>
        <div className="flex flex-row w-full items-center">
            <Input startContent={<Search />} className='w-full' type='text' label='Filter by challenge name' labelPlacement='outside' placeholder='Type to filter...' value={filter} onValueChange={setFilter} />
            <Button onPress={() => { resetForm(); modal.onOpen(); }} className='p-4 ml-2 mb-[-23]' color='default' variant='flat'><Plus size={50} /> Add Challenge</Button>
        </div>
        <Table aria-label="Admin Challenges Table">
            <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn>Category</TableColumn>
                <TableColumn>Points</TableColumn>
                <TableColumn>Type</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={`${loading ? 'Loading Table...' : 'No challenges found'}`}>
                {items?.map(challenge => {
                    return <TableRow key={challenge.id} className={`${challenge.hidden ? 'text-success' : ''}`}>
                        <TableCell>{challenge.id}</TableCell>
                        <TableCell>{challenge.title}</TableCell>
                        <TableCell>{challenge.category}</TableCell>
                        <TableCell>{challenge.points}</TableCell>
                        <TableCell>{challenge.type}</TableCell>
                        <TableCell className='flex flex-row gap-1'>
                            <Tooltip color="secondary" closeDelay={0} content="Edit Challenge"><Pen onClick={() => handleEditChallenge(challenge)} className='text-secondary cursor-pointer' /></Tooltip>
                            <Tooltip color="danger" closeDelay={0} content="Delete Challenge"><Trash2 onClick={() => handleDeleteChallenge(challenge.id, challenge.title)} className='text-danger cursor-pointer' /></Tooltip>
                        </TableCell>
                    </TableRow>
                }) ?? []}
            </TableBody>
        </Table>
        {pages > 1 && <Pagination page={page} total={pages} onChange={setPage} />}
        <Modal isOpen={modal.isOpen} onClose={modal.onClose} onOpenChange={modal.onOpenChange} size="5xl">
            <ModalContent>
                <ModalHeader>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</ModalHeader>
                <ModalBody>
                    <Tabs fullWidth>
                        <Tab key="Challenge Details" title="Challenge Details">
                            <Input startContent={<IdCard />} className='pb-3' isRequired type='text' label='Challenge Name' labelPlacement='outside' placeholder='Enter challenge name' value={challengeName} onValueChange={setChallengeName} />
                            <Textarea startContent={<ScrollText />} className='pb-3' type='text' label='Description' minRows={5} maxRows={5} labelPlacement='outside' placeholder='Enter challenge description' value={challengeDescription} onValueChange={setChallengeDescription} />
                            <Input startContent={<ChartColumnStacked />} className='pb-3' type='text' label='Category' labelPlacement='outside' placeholder='Enter challenge category' value={challengeCategory} onValueChange={setChallengeCategory} />
                            <label className='mb-2 block text-sm font-medium text-foreground'>Flags</label>
                            <Button startContent={<LandPlot />} variant='flat' color='default' fullWidth onPress={flagsModal.onOpen}>Open Flag Menu</Button>
                        </Tab>
                        <Tab key="Challenge Type" title="Challenge Type">
                            <Select startContent={<Section />} className='pb-3' isRequired label='Type' labelPlacement='outside' placeholder='Select challenge type' selectedKeys={[challengeType]} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChallengeType(e.target.value)}>
                                <SelectItem key='Static'>Static</SelectItem>
                                <SelectItem key='Dynamic'>Dynamic</SelectItem>
                            </Select>
                            <NumberInput startContent={<Hash />} isRequired type='number' label='Points' labelPlacement='outside' placeholder='Enter challenge points' value={challengePoints} onValueChange={setChallengePoints} />
                        </Tab>
                        <Tab key="Hints and Files" title="Hints and Files">
                            <label className='mb-2 block text-sm font-medium text-foreground'>Hints</label>
                            <Button startContent={<Lightbulb />} className='mb-2' variant='flat' color='default' fullWidth onPress={hintsModal.onOpen}>Open Hints Menu</Button>
                            <label className='mb-2 block text-sm font-medium text-foreground'>Files</label>
                            <Button startContent={<Layers />} variant='flat' color='default' fullWidth>Open Files Menu</Button>
                        </Tab>
                        <Tab key="Additional Details" title="Additional Details">
                            <Select startContent={<Eye />} className='pb-3' isRequired label='State' labelPlacement='outside' placeholder='Select challenge state' selectedKeys={[challengeState]} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChallengeState(e.target.value as 'VISIBLE' | 'HIDDEN')}>
                                <SelectItem key='VISIBLE'>Visible</SelectItem>
                                <SelectItem key='HIDDEN'>Hidden</SelectItem>
                            </Select>
                            <NumberInput startContent={<Hash />} className='pb-3' type='number' label='Max Attempts (0 is unlimited)' labelPlacement='outside' placeholder='Enter max attempts' value={challengeMaxAttempts} onValueChange={setChallengeMaxAttempts} />
                            <Input startContent={<Tag />} type='text' label='Tags (Comma Separated)' labelPlacement='outside' placeholder='e.g. web, crypto, forensics' value={challengeTags.join(', ')} onValueChange={(value) => setChallengeTags(value.split(',').map(tag => tag.trim()))} />
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={handleCreateChallenge} className='w-full' variant='flat' color='primary'>{editingChallenge ? 'Update Challenge' : 'Create Challenge'}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={flagsModal.isOpen} onClose={flagsModal.onClose} onOpenChange={flagsModal.onOpenChange} size="lg">
            <ModalContent>
                <ModalHeader>Manage Flags</ModalHeader>
                <ModalBody className='flex flex-col gap-2'>
                    {challengeFlags.map((flag, index) => (
                        <div key={index} className="flex flex-row gap-2 justify-between items-center">
                            <Input startContent={<LandPlot />} isRequired className='w-full' type='text' label='Flag Content' labelPlacement='outside' placeholder='Enter flag content' value={flag.content} onValueChange={(value) => {
                                const newFlags = [...challengeFlags]
                                newFlags[index].content = value
                                setChallengeFlags(newFlags)
                            }} />
                            <Select isRequired className='ml-2 w-1/3' label='Flag Type' labelPlacement='outside' placeholder='Select flag type' selectedKeys={[flag.type]} onChange={(e) => {
                                const newFlags = [...challengeFlags]
                                newFlags[index].type = e.target.value as 'CASE_INSENSITIVE' | 'CASE_SENSITIVE'
                                setChallengeFlags(newFlags)
                            }}>
                                <SelectItem key='CASE_INSENSITIVE'>Case Insensitive</SelectItem>
                                <SelectItem key='CASE_SENSITIVE'>Case Sensitive</SelectItem>
                            </Select>
                            <X className='text-danger cursor-pointer mt-5' size={40} onClick={() => {
                                const newFlags = challengeFlags.filter((_, i) => i !== index)
                                setChallengeFlags(newFlags)
                            }} />
                        </div>
                    ))}
                    <Button className='w-1/2' variant='flat' color='default' onPress={() => setChallengeFlags([...challengeFlags, { content: '', type: 'CASE_INSENSITIVE' }])}>Add Flag</Button>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={flagsModal.onClose} className='w-full' variant='flat' color='default'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={hintsModal.isOpen} onClose={hintsModal.onClose} onOpenChange={hintsModal.onOpenChange} size="lg">
            <ModalContent>
                <ModalHeader>Manage Hints</ModalHeader>
                <ModalBody className='flex flex-col gap-2'>
                    {challengeHints.map((hint, index) => (
                        <div key={index} className="flex flex-row gap-2 justify-between items-center">
                            <Input startContent={<Lightbulb />} isRequired className='w-full' type='text' label='Hint Content' labelPlacement='outside' placeholder='Enter hint content' value={hint.content} onValueChange={(value) => {
                                const newHints = [...challengeHints]
                                newHints[index].content = value
                                setChallengeHints(newHints)
                            }} />
                            <NumberInput isRequired className='ml-2 w-1/3' type='number' label='Hint Cost' labelPlacement='outside' placeholder='0' value={hint.cost} onValueChange={(value) => {
                                const newHints = [...challengeHints]
                                newHints[index].cost = value
                                setChallengeHints(newHints)
                            }} />
                            <X className='text-danger cursor-pointer mt-5' size={40} onClick={() => {
                                const newHints = challengeHints.filter((_, i) => i !== index)
                                setChallengeHints(newHints)
                            }} />
                        </div>
                    ))}
                    <Button className='w-1/2' variant='flat' color='default' onPress={() => setChallengeHints([...challengeHints, { content: '', cost: 0 }])}>Add Hint</Button>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={hintsModal.onClose} className='w-full' variant='flat' color='default'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </div>
}
