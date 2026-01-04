import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { signUp } from '@sailviz/auth/client'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { UserType } from '@sailviz/types'

export function RegisterForm() {
    const navigate = useNavigate()
    const [name, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [clubName, setClubName] = useState('')
    const [email, setEmail] = useState('')

    const createClubMutation = useMutation(orpcClient.organization.create.mutationOptions())
    const updateUserMutation = useMutation(orpcClient.user.update.mutationOptions())

    const createClub = async () => {
        //create a club for each fleet
        let club = await createClubMutation.mutateAsync({ name: clubName })
        console.log('Created club:', club)

        const { data, error } = await signUp.email({
            email: email,
            password: password,
            username: name,
            name: name,
            startPage: 'Dashboard'
        })
        console.log('Sign up response:', data, error)
        if (error) {
            console.error('Error signing up:', error)
            return
        }

        //add sailviz specific fields to the user
        let user = {
            id: data.user.id,
            clubId: club.id,
            startPage: 'Dashboard',
            name: name,
            admin: false,
            uuid: '',
            email: '',
            emailVerified: false,
            image: '',
            createdAt: new Date(),
            updatedAt: new Date()
        } as UserType
        await updateUserMutation.mutateAsync(user)
        navigate({ to: '/Dashboard' })
    }
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center gap-2'>
                    <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                        <span className='sr-only'>SailViz</span>
                    </a>
                    <h1 className='text-xl font-bold'>Welcome to SailViz.</h1>
                    <div className='text-center text-sm'>
                        Already have an account?{' '}
                        <a href='/Login' className='underline underline-offset-4'>
                            Login
                        </a>
                    </div>
                </div>
            </div>
            <>
                <div className='flex flex-col gap-6'>
                    <div className='grid gap-2'>
                        Club Name
                        <Input
                            id='clubName'
                            name='clubName'
                            required
                            value={clubName}
                            onChange={e => {
                                setClubName(e.target.value)
                                setUsername(e.target.value + '_Admin')
                            }}
                        />
                    </div>
                    <div className='grid gap-2'>
                        Username
                        <Input id='name' name='name' value={name} />
                    </div>
                    <div className='grid gap-2'>
                        Email
                        <Input id='email' name='email' required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className='grid gap-2'>
                        Password
                        <Input id='password' name='password' type='password' required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type='submit' className='w-full' onClick={createClub}>
                        <span>Create Account</span>
                    </Button>
                </div>
            </>
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
