"use client"

import { loginUser, registerUser } from "@/lib/userUtils"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Form } from "@heroui/form"
import { FormEvent } from "react"

export function CTFRegisterForm({ ctfId }: { ctfId: string }) {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        registerUser({ name: data.Username as string, email: data.Email as string, password: data.Password as string, ctfId })
        .then(() => alert("User registered successfully"))
        .catch((e: Error) => alert(e.message))
    }

    return <Form className="w-full justify-center items-center space-y-4" onSubmit={onSubmit}>
        <div className="flex flex-col w-3/5 space-y-10">
            <Input isRequired label="Username" labelPlacement="outside" name="Username" type="text" placeholder="Enter Username for the CTF" />
            <Input isRequired label="Email" labelPlacement="outside" name="Email" type="email" placeholder="Never shown to the public" />
            <Input isRequired label="Password" labelPlacement="outside" name="Password" type="password" placeholder="Password for your account" />
            <Button className="w-full" color="primary" type="submit">Submit</Button>
        </div>
    </Form>
}

export function CTFLoginForm({ ctfId }: { ctfId: string }) {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        loginUser({ email: data.Email as string, password: data.Password as string, ctfId })
        .then(() => alert("User logged in successfully"))
        .catch((e: Error) => alert(e.message))
    }

    return <Form className="w-full justify-center items-center space-y-4" onSubmit={onSubmit}>
        <div className="flex flex-col w-3/5 space-y-10">
            <Input isRequired label="Email" labelPlacement="outside" name="Email" type="email" placeholder="Never shown to the public" />
            <Input isRequired label="Password" labelPlacement="outside" name="Password" type="password" placeholder="Password for your account" />
            <Button className="w-full" color="primary" type="submit">Submit</Button>
        </div>
    </Form>
}