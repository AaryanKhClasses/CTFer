'use client'

import { addToast, Button, CalendarDate, DateInput, Input, NumberInput, Tab, Tabs, Textarea } from '@heroui/react'
import { getLocalTimeZone } from '@internationalized/date'
import { Calendar, IdCard, KeyRound, Mail, Scaling, ScrollText, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SetupPage() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [adminUsername, setAdminUsername] = useState('')
    const [adminEmail, setAdminEmail] = useState('')
    const [adminPassword, setAdminPassword] = useState('')
    const [teamSize, setTeamSize] = useState(1)
    const [logoURL, setLogoURL] = useState('')
    const [startTime, setStartTime] = useState<CalendarDate | null>(null)
    const [endTime, setEndTime] = useState<CalendarDate | null>(null)
    const [selectedTab, setSelectedTab] = useState("Beginning")

    const handleFinishSetup = async () => {
        const res = await fetch('/api/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                adminUsername,
                adminEmail,
                adminPassword,
                teamSize,
                logoURL,
                startTime: startTime ? startTime?.toDate(getLocalTimeZone()) : null,
                endTime: endTime ? endTime?.toDate(getLocalTimeZone()) : null
            })
        })
        if(res.ok) return window.location.href = '/'
        if(res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json()
            addToast({
                title: 'Setup Failed',
                description: data.error,
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000
            })
        }
    }

    useEffect(() => {
        const checkSetup = async() => {
            const res = await fetch('/api/setup')
            const data = await res.json()
            if(data.setup) window.location.href = '/'
        }
        checkSetup()
    }, [])

    return <div className="flex flex-col items-center p-5 gap-3">
        <h1 className="text-4xl font-bold py-5">Setup</h1>
        <Tabs fullWidth selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
            <Tab key="Beginning" title="Beginning">
                <div className="flex min-w-[90vw] bg-[#1d1f1f] flex-col rounded-lg p-5 gap-3">
                    <h1 className='mb-5'>The most basic settings to get you started. Enter the CTF Name and Description so everyone knows what your event is about.</h1>
                    <Input isRequired value={name} onValueChange={setName} startContent={<IdCard />} label="CTF Name" placeholder='Enter CTF Name' labelPlacement='outside' />
                    <Textarea value={description} onValueChange={setDescription} startContent={<ScrollText />} label="CTF Description" placeholder='Enter CTF Description' labelPlacement='outside' />
                    <Button color='primary' variant='flat' onPress={() => setSelectedTab("Admin")}>Proceed to Admin Settings</Button>
                </div>
            </Tab>
            <Tab key="Admin" title="Admin">
                <div className="flex min-w-[90vw] bg-[#1d1f1f] flex-col rounded-lg p-5 gap-3">
                    <h1 className='mb-5'>A CTF Needs at least one Admin to manage the event. Enter the Admin Username, Email, and Password to create the first Admin account.</h1>
                    <Input isRequired value={adminUsername} onValueChange={setAdminUsername} startContent={<UserCircle />} label="Admin Username" placeholder='Enter Admin Username' labelPlacement='outside' />
                    <Input isRequired value={adminEmail} onValueChange={setAdminEmail} startContent={<Mail />} label="Admin Email" placeholder='Enter Admin Email' labelPlacement='outside' type='email' />
                    <Input isRequired value={adminPassword} onValueChange={setAdminPassword} startContent={<KeyRound />} label="Admin Password" placeholder='Enter Admin Password' labelPlacement='outside' type='password' />
                    <Button color='primary' variant='flat' onPress={() => setSelectedTab("More Setup")}>Proceed to More Setup</Button>
                </div>
            </Tab>
            <Tab key="More Setup" title="More Setup">
                <div className="flex min-w-[90vw] bg-[#1d1f1f] flex-col rounded-lg p-5 gap-3">
                    <h1 className='mb-5'>Last but not least, configure the remaining settings to finalize your CTF setup.</h1>
                    <NumberInput value={teamSize} onValueChange={setTeamSize} startContent={<Scaling />} defaultValue={1} label="Team Size (Default Solo)" placeholder='Enter Team Size' labelPlacement='outside' />
                    <Input value={logoURL} onValueChange={setLogoURL} startContent={<UserCircle />} label="Logo URL" placeholder='Enter Logo URL' labelPlacement='outside' />
                    <DateInput value={startTime} onChange={setStartTime} granularity='minute' startContent={<Calendar className='text-white' />} label="CTF Start Time" labelPlacement='outside' />
                    <DateInput value={endTime} onChange={setEndTime} granularity='minute' startContent={<Calendar className='text-white' />} label="CTF End Time" labelPlacement='outside' />
                    <Button color='primary' variant='flat' onPress={handleFinishSetup}>Complete Setup</Button>
                </div>
            </Tab>
        </Tabs>
    </div>
}
