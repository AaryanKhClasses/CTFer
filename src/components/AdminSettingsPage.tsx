"use client"

import { Input, Textarea } from "@heroui/input"
import { Checkbox } from "@heroui/checkbox"
import { useState } from "react"
import { Button } from "@heroui/button"
import { updateCTF } from "@/lib/CTFUtils"

type CTFProps = {
    id: string
    name: string
    description: string
    running: boolean
}

export default function AdminSettingsPage({ ctf }: { ctf: CTFProps }) {
    const [ctfname, setCtfName] = useState(ctf.name)
    const [ctfDesc, setCtfDesc] = useState(ctf.description)
    const [ctfrunning, setCtfRunning] = useState(ctf.running)

    const handleChanges = () => {
        updateCTF({ id: ctf.id, name: ctfname, description: ctfDesc, running: ctfrunning })
        .then(() => alert('Changes saved!'))
        .catch(e => alert(e.message))
    }

    return <>
        <div className="flex flex-col space-y-3">
            <h1 className="text-[1.5rem] font-bold mb-10">General Settings:</h1>
            <Input defaultValue={ctfname} label="CTF Name" labelPlacement="outside" classNames={{ label: 'text-[1.2rem]' }} onValueChange={setCtfName} />
            <Checkbox isSelected={ctfrunning} onValueChange={setCtfRunning}>CTF Running</Checkbox>
            <Textarea defaultValue={ctfDesc} label="Home Page Contents" labelPlacement="outside" classNames={{ label: 'text-[1.2rem]' }} onValueChange={setCtfDesc} />
            <Button onPress={handleChanges}>Save Changes</Button>
        </div>
    </>
}