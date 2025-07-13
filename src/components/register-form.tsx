'use client'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUp } from '@/lib/auth-client'
import { useState } from 'react'
import * as DB from '@/components/apiMethods'
import { useRouter } from 'next/navigation'

export function RegisterForm() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [clubName, setClubName] = useState('')
    const [email, setEmail] = useState('')

    const createClub = async () => {
        //create a club for each fleet
        let club = await DB.createClub(clubName)
        console.log('Created club:', club)
        let roles = await DB.GetRolesByClubId(club.id)
        console.log('Roles for club:', roles)

        const { data, error } = await signUp.email({
            email: email,
            password: password,
            username: username,
            clubId: club.id,
            startPage: '/Dashboard',
            name: username
        })
        console.log('Sign up response:', data, error)
        if (error) {
            console.error('Error signing up:', error)
            return
        }

        //create a user for the club admin and assign them the admin role
        if (roles[0] == undefined || roles.length == 0) {
            console.error('No roles found for club', club.id)
            return
        }
        //add sailviz specific fields to the user
        let user = {
            id: data.user.id,
            clubId: club.id,
            startPage: 'Dashboard',
            displayUsername: username,
            username: username,
            admin: false,
            uuid: '',
            roles: [
                {
                    id: roles[0].id,
                    name: 'Admin',
                    clubId: club.id,
                    permissions: {
                        allowed: []
                    }
                }
            ]
        } as UserDataType
        await DB.updateUser(user)
        router.push('/Dashboard')
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
                        <Input id='username' name='username' value={username} />
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
