"use client"

import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal"
import { Button } from "@heroui/button"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { FormEvent } from "react"
import { registerCTF } from "@/lib/CTFUtils"

export default function CreateCTFModal() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure()

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        registerCTF({ name: data.CTFName as string, adminName: data.AdminUsername as string, adminEmail: data.AdminEmail as string, adminPassword: data.AdminPassword as string })
        .then(() => alert("CTF created successfully"))
        .catch((e: Error) => alert(e.message))
    }

    return <>
        <Button onPress={onOpen}>Create New CTF</Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Create New CTF</ModalHeader>
                        <ModalBody>
                            <Form className="w-full justify-center items-center space-y-4" onSubmit={onSubmit}>
                                <div className="flex flex-col w-full space-y-10">
                                    <Input isRequired label="CTF Name" labelPlacement="outside" name="CTFName" type="text" placeholder="Enter Name of the CTF" />
                                    <Input isRequired label="Admin Username" labelPlacement="outside" name="AdminUsername" type="text" placeholder="Enter Admin Username for the CTF" />
                                    <Input isRequired label="Admin Email" labelPlacement="outside" name="AdminEmail" type="email" placeholder="Never shown to the public" />
                                    <Input isRequired label="Admin Password" labelPlacement="outside" name="AdminPassword" type="password" placeholder="Password for admin account" />
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