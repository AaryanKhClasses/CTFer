'use client'

import { addToast, Button, Form, Input, Link } from '@heroui/react'
import { CircleUser, KeyRound } from 'lucide-react'
import { useEffect } from 'react'

export default function LoginPage() {
    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password')
            })
        })
        if(res.ok) return window.location.href = '/'
        if(res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json()
            addToast({
                title: 'Login Failed',
                description: data.error,
                color: 'danger',
                shouldShowTimeoutProgress: true,
                timeout: 5000
            })
        }
    }

    useEffect(() => {
        fetch('/api/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if(data.authenticated) window.location.href = '/'
        })
    }, [])

    return <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-4xl font-bold mb-[10vh]'>Login</h1>
        <Form className='p-10 min-h-[50vh] flex justify-center items-center bg-[#1d1f1f] rounded-lg' onSubmit={onSubmit}>
            <Input isRequired name='username' className='w-[35vw]' startContent={<CircleUser />} placeholder='Enter username' label='Username' labelPlacement='outside' />
            <Input isRequired name='password' className='w-[35vw]' startContent={<KeyRound />} placeholder='Enter password' label='Password' labelPlacement='outside' type='password' />
            <Button className='w-full mt-4' variant='solid' color='default' type='submit'>Login</Button>
            <div className='flex flex-row pt-3 justify-between w-full items-center'>
                <Link href='/register' color='foreground'>No account?</Link>
                <Link href='/forget-password' color='foreground'>Forgot Password?</Link>
            </div>
        </Form>
    </div>
}
