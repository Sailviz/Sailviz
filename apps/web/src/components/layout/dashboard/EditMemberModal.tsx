import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'
import { client } from '@sailviz/auth/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'

export default function EditMemberDialog({ member, open, onClose }: { member: Types.Member; open: boolean; onClose?: () => void }) {
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedTeam, setSelectedTeam] = useState<Types.Team>()

    const roles = ['owner', 'admin', 'member']
    const [teams, setTeams] = useState<Types.Team[]>([])

    const updateMember = async (member: Types.Member) => {
        client.organization.updateMemberRole({
            memberId: member.id,
            role: selectedRole
        })

        client.organization.addTeamMember({
            userId: member.user.id,
            teamId: selectedTeam?.id || ''
        })

        onClose && onClose()
    }

    const removeMember = async (user: Types.Member) => {
        if (confirm('Are you sure you want to delete this user?')) {
            client.organization.removeMember({
                memberIdOrEmail: user.id
            })
            onClose && onClose()
        }
    }

    useEffect(() => {
        if (member === undefined) return
        setSelectedRole(member.role)
    }, [member])

    useEffect(() => {
        if (member === undefined) return

        const fetchTeams = async () => {
            const { data } = await client.organization.listTeams({
                query: {
                    organizationId: member.organizationId
                }
            })
            console.log('Fetched teams:', data)
            setTeams(data!)
        }
        fetchTeams()
    }, [member])

    useEffect(() => {
        console.log('Selected team changed:', selectedTeam)
    }, [selectedTeam])

    return (
        <Dialog open={open} onOpenChange={open ? onClose : undefined}>
            <DialogContent className='max-w-8/12'>
                <DialogTitle className='flex flex-col gap-1'>Edit Member - {member?.user?.name}</DialogTitle>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Role</p>

                        <Select
                            onValueChange={value => {
                                console.log('Selected value:', value)
                                setSelectedRole(value)
                            }}
                            value={selectedRole}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a Role' />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role: string) => (
                                    <SelectItem value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold text-gray-700'>Team</p>

                        <Select
                            onValueChange={value => {
                                console.log('Selected value:', value)
                                setSelectedTeam(teams.find(team => team.id == value))
                            }}
                            value={selectedTeam?.name}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a Team' />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team: Types.Team) => (
                                    <SelectItem value={team.id}>{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'red'} onClick={() => removeMember(member)}>
                        Remove
                    </Button>
                    <Button color='primary' onClick={() => updateMember(member)}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
