"use client"

import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal"
import { toggleChallenge, deleteChallenge, editChallenge } from "@/lib/challengeUtils"
import { AlignJustify, CircleX, Edit } from "lucide-react"
import { FormEvent, useTransition } from "react"
import { Input, Textarea } from "@heroui/input"
import { useRouter } from "next/navigation"
import { Tooltip } from "@heroui/tooltip"
import { Button } from "@heroui/button"
import { Form } from "@heroui/form"

export function ToggleChallenge({ id, ctfId, enabled }: { id: string, ctfId: string, enabled: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    return <span aria-disabled={isPending} onClick={() => {
        startTransition(async () => {
            await toggleChallenge(id, ctfId, !enabled)
            router.refresh()
        })
    }}> { enabled ?
        <Tooltip content="Disable Challenge"><span className="text-lg text-danger cursor-pointer active:opacity-50"><AlignJustify /></span></Tooltip>
        : <Tooltip content="Enable Challenge"><span className="text-lg text-default-400 cursor-pointer active:opacity-50"><AlignJustify /></span></Tooltip>
    }
    </span>
}

export function DeleteChallenge({ id, ctfId }: { id: string, ctfId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    return <span aria-disabled={isPending} onClick={() => {
        startTransition(async () => {
            await deleteChallenge(id, ctfId)
            router.refresh()
        })
    }}> <Tooltip content="Delete Challenge"><span className="text-lg text-danger cursor-pointer active:opacity-50"><CircleX /></span></Tooltip>
    </span>
}

type ChallengeProps = {
    id: string
    ctfId: string
    name: string
    points: number
    flag: string
    description: string
}

export function EditChallenge({ data }: { data: ChallengeProps }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newData = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        editChallenge({ id: data.id, ctfId: data.ctfId, name: newData.CHName as string, points: parseInt(newData.CHPoints as string), flag: newData.CHFlag as string, description: newData.CHDescription as string })
        .then(() => {
            alert("Challenge updated successfully")
            onOpenChange()
        })
        .catch((e: Error) => alert(e.message))
    }

    return <>
        <span onClick={onOpen}>
            <Tooltip content="Edit Challenge"><span className="text-lg text-default-400 cursor-pointer active:opacity-50"><Edit /></span></Tooltip>
        </span>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Edit Challenge</ModalHeader>
                        <ModalBody>
                            <Form className="w-full justify-center items-center space-y-4" onSubmit={onSubmit}>
                                <div className="flex flex-col w-full space-y-10">
                                    <Input isRequired label="Challenge Title" labelPlacement="outside" name="CHName" type="text" defaultValue={data.name} />
                                    <Input isRequired label="Challenge Points" labelPlacement="outside" name="CHPoints" type="number" defaultValue={data.points.toString()} />
                                    <Input isRequired label="Challenge Flag" labelPlacement="outside" name="CHFlag" type="text" defaultValue={data.flag} />
                                    <Textarea isRequired label="Challenge Description" labelPlacement="outside" name="CHDescription" defaultValue={data.description} />
                                    <div className="flex flex-row w-full space-x-2">
                                        <Button className="w-full" color="default" type="submit">Submit</Button>
                                        <Button className="w-full" color="default" variant="bordered" onPress={onClose}>Cancel</Button>
                                    </div>
                                </div>
                            </Form>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    </>
}