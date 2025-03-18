"use client"

import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal"
import { createTeam, joinTeam } from "@/lib/teamUtils"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Form } from "@heroui/form"
import { FormEvent } from "react"

export function CreateTeamModal({ id, userId, inTeam }: { id: string, userId: string | undefined, inTeam: boolean }) {
    const createModal = useDisclosure()
    const joinModal = useDisclosure()

    const onCreateSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        createTeam({ ctfId: id, userId: userId as string, teamName: data.TName as string })
        .then(() => {
            alert("Team created successfully")
            createModal.onOpenChange()
        })
        .catch((e: Error) => alert(e.message))
    }

    const onJoinSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        joinTeam({ ctfId: id, userId: userId as string, teamId: data.TID as string })
        .then(() => {
            alert("Team joined successfully")
            joinModal.onOpenChange()
        })
        .catch((e: Error) => alert(e.message))
    }

    return <>
        { !inTeam ? <div className="flex flex-row w-full justify-end space-x-2 m-2">
            <Button color="primary" onPress={createModal.onOpen}>Create New Team</Button>
            <Button color="primary" onPress={joinModal.onOpen}>Join Team</Button>
        </div> : <></> }
        <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Create New Team</ModalHeader>
                        <ModalBody>
                            <Form className="w-full justify-center items-center space-y-4" onSubmit={onCreateSubmit}>
                                <div className="flex flex-col w-full space-y-10">
                                    <Input isRequired label="Team Name" labelPlacement="outside" name="TName" type="text" placeholder="Enter Name of the Team" />
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
        <Modal isOpen={joinModal.isOpen} onOpenChange={joinModal.onOpenChange}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Join Team</ModalHeader>
                        <ModalBody>
                            <Form className="w-full justify-center items-center space-y-4" onSubmit={onJoinSubmit}>
                                <div className="flex flex-col w-full space-y-10">
                                    <Input isRequired label="Team ID" labelPlacement="outside" name="TID" type="text" placeholder="Enter Team ID" />
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