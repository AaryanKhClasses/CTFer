"use client"

import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal"
import { Input, Textarea } from "@heroui/input"
import { addChallenge } from "@/lib/challengeUtils"
import { Button } from "@heroui/button"
import { Form } from "@heroui/form"
import { FormEvent } from "react"

export default function CreateChallengeModal({ id }: { id: string }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        addChallenge({ ctfId: id, name: data.CHName as string, points: parseInt(data.CHPoints as string), flag: data.CHFlag as string, description: data.CHDescription as string })
        .then(() => {
            alert("Challenge created successfully")
            onOpenChange()
        })
        .catch((e: Error) => alert(e.message))
    }

    return <>
        <Button color="primary" onPress={onOpen}>Create New Challenge</Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Create New Challenge</ModalHeader>
                        <ModalBody>
                            <Form className="w-full justify-center items-center space-y-4" onSubmit={onSubmit}>
                                <div className="flex flex-col w-full space-y-10">
                                    <Input isRequired label="Challenge Title" labelPlacement="outside" name="CHName" type="text" placeholder="Enter Name of the Challenge" />
                                    <Input isRequired label="Challenge Points" labelPlacement="outside" name="CHPoints" type="number" placeholder="Enter Points for the Challenge" />
                                    <Input isRequired label="Challenge Flag" labelPlacement="outside" name="CHFlag" type="text" placeholder="Enter Challenge Flag" />
                                    <Textarea isRequired label="Challenge Description" labelPlacement="outside" name="CHDescription" placeholder="Enter Description of the Challenge" />
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