"use client"

import { Card, CardBody, CardHeader } from "@heroui/card"
import { Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/modal"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { useState } from "react"
import { validateFlag } from "@/lib/challengeUtils"

type ChallengeProps = {
    ctfId: string
    id: string
    name: string
    points: number
    description: string
}

export function ChallengeModal({ chall, solved }: { chall: ChallengeProps, solved: boolean }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [flag, setFlag] = useState("")

    const handleSubmit = async () => {
        await validateFlag(chall.id, chall.ctfId, flag)
            .then(() => alert("Correct flag!"))
            .catch(e => alert(e.message))
    }

    return <>
        <Card key={chall.id} className="cursor-pointer" isPressable onPress={onOpen} style={solved ? { backgroundColor: 'green' } : {}}>
            <CardHeader className="text-center text-[1.5rem] line-clamp-2 break-words">{chall.name}</CardHeader>
            <CardBody className="text-center">{chall.points}</CardBody>
        </Card>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
            <ModalContent>
                {onClose => (
                    <ModalBody>
                        <h1 className="text-center text-[1.5rem] font-bold pt-1.5">{chall.name}</h1>
                        <h2 className="text-center text-[1.2rem]">{chall.points} Points</h2>
                        <p className="p-2">{chall.description}</p>
                        {!solved ? <>
                            <Input type="text" placeholder="Flag" value={flag} onValueChange={setFlag} />
                            <Button onPress={handleSubmit}>Submit Flag</Button>
                        </>: <></>}
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>

    </>
}