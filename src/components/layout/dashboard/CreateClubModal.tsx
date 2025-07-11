'use client'
import { useTheme } from 'next-themes'
import { ChangeEvent, startTransition, useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mutate } from 'swr'
import * as DB from '@/components/apiMethods'
import { signUp } from '@/lib/auth-client'
export default function CreateClubModal() {
    const [clubName, setClubName] = useState('')
    const [adminName, setAdminName] = useState('')
    const [adminPassword, setAdminPassword] = useState('')
    const [open, setOpen] = useState(false)
    const [clubNameError, setClubNameError] = useState(false)

    let submitDisabled = false

    const Submit = async () => {
        //don't process submission if it's disabled
        if (submitDisabled == true) return

        //check if all fields are filled in
        submitDisabled = true
        let error = false
        if (clubName == '') {
            setClubNameError(true)
            error = true
        }
        // if not all filled in, enable submit button and return
        if (error) {
            submitDisabled = false
            return
        }
        console.log('submitting')

        await createClub(clubName)
        mutate(`/api/GetClubs`)

        setOpen(false)
    }

    const createClub = async (clubName: string) => {
        //create a club for each fleet
        let club = await DB.createClub(clubName)
        console.log('Created club:', club)
        let roles = await DB.GetRolesByClubId(club.id)
        console.log('Roles for club:', roles)

        const { data, error } = await signUp.email({
            email: `${adminName}@sailviz.com`,
            password: adminPassword,
            username: adminName,
            clubId: club.id,
            startPage: '/Dashboard',
            name: adminName
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
            displayUsername: adminName,
            username: adminName,
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
    }

    const clearFields = async () => {
        console.log('clearing fields')
        setClubName('')
        submitDisabled = false
    }

    const generatePassword = (length: number) => {
        //generate a random password
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?'
        let password = ''
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            password += characters[randomIndex]
        }
        setAdminPassword(password)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                clearFields()
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                <Button aria-label='create new club'>Create New Club</Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Create New Club</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Name</p>

                        <Input
                            id='clubName'
                            type='text'
                            value={clubName}
                            onChange={e => {
                                setClubNameError(false)
                                setClubName(e.target.value)
                                setAdminName(e.target.value + '_Admin')
                                generatePassword(12)
                            }}
                            placeholder='J Bloggs'
                            autoComplete='off'
                        />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Admin Account</p>

                        <Input id='clubName' type='text' value={adminName} />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Admin Password</p>

                        <Input id='clubName' type='text' value={adminPassword} />
                    </div>
                </div>

                <DialogFooter>
                    <Button color='success' onClick={Submit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
