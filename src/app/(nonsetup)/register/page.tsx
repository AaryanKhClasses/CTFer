'use client'

import { addToast, Button, Form, Input, Link } from '@heroui/react'
import { KeyRound, Mail } from 'lucide-react'
import { useEffect } from 'react'

export default function RegisterPage() {
    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                username: formData.get('username'),
                password: formData.get('password')
            })
        })
        if(res.ok) return window.location.href = '/'
        if(res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json()
            addToast({
                title: 'Registration Failed',
                description: data.error,
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000
            })
        }
    }

    useEffect(() => {
        fetch('/api/me')
        .then(res => res.json())
        .then(data => {
            if(data.authenticated) window.location.href = '/'
        })
    }, [])

    return <div className='flex flex-col items-center justify-center min-h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Register</h1>
        <Form className='p-10 min-h-[60vh] flex justify-center items-center bg-[#1d1f1f] rounded-lg' onSubmit={onSubmit}>
            <Input isRequired name='email' className='w-[35vw]' startContent={<Mail />} placeholder='Enter email' label='Email' labelPlacement='outside' type='email' />
            <Input isRequired name='username' className='w-[35vw]' startContent={<Mail />} placeholder='Enter username' label='Username' labelPlacement='outside' />
            <Input isRequired name='password' className='w-[35vw]' startContent={<KeyRound />} placeholder='Enter password' label='Password' labelPlacement='outside' type='password' />
            <Button className='w-full mt-4' variant='solid' color='default' type='submit'>Register</Button>
            <div className='flex flex-row pt-3 justify-center w-full items-center'>
                <Link href='/login' color='foreground'>Already have an account?</Link>
            </div>
        </Form>
    </div>
}
