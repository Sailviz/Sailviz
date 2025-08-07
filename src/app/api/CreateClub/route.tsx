import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

import assert from 'assert'
import { create } from 'sortablejs'
import { createStripeCustomer } from '@/lib/payments/stripe'

async function findClub(name: string) {
    var result = await prisma.club.findUnique({
        where: {
            name: name
        }
    })
    return result
}

async function setDefaultSettings(clubId: string) {
    var result = await prisma.club.update({
        where: { id: clubId },
        data: {
            settings: {
                duties: ['OD', 'Safety', 'Rescue'],
                trackable: {
                    enabled: false,
                    orgID: ''
                },
                clockOffset: 1,
                pursuitLength: 60
            }
        }
    })
    return result
}

async function createClub(name: string) {
    return prisma.club.create({
        data: {
            name: name,
            displayName: name,
            settings: {
                duties: ['Race Officer', 'Assistant Race Officer', 'Safety Officer', 'Assistant Safety Officer', 'Duty Officer'],
                hornIP: '',
                clockIP: '',
                trackable: { orgID: '', enabled: false },
                clockOffset: 1,
                pursuitLength: 60
            }
        }
    })
}

async function createAdminRole(clubId: string) {
    return prisma.role.create({
        data: {
            name: 'Admin',
            clubId: clubId,
            permissions: {
                allowed: [
                    { label: 'Edit Series', value: 'editSeries' },
                    { label: 'Edit Races', value: 'editRaces' },
                    { label: 'Edit Fleets', value: 'editFleets' },
                    { label: 'Edit Results', value: 'editResults' },
                    { label: 'Edit Boats', value: 'editBoats' },
                    { label: 'Edit Hardware', value: 'editHardware' },
                    { label: 'Edit Users', value: 'editUsers' },
                    { label: 'Edit Roles', value: 'editRoles' },
                    { label: 'Download Results', value: 'DownloadResults' },
                    { label: 'Upload Entries', value: 'UploadEntires' },
                    { label: 'View Integrations', value: 'viewIntegrations' },
                    { label: 'View Developer', value: 'viewDeveloper' },
                    { label: 'View Users', value: 'viewUsers' },
                    { label: 'Dashboard Access', value: 'dashboardAccess' },
                    { label: 'Edit Duties', value: 'editDuties' },
                    { label: 'Trackable - View Settings', value: 'trackableView' },
                    { label: 'Advanced Result edit', value: 'advancedResultEdit' }
                ]
            }
        }
    })
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubName, 'Name required')
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var name = req.clubName

    var Existingclub = await findClub(name)
    if (!Existingclub) {
        var Club = await createClub(name)
        createAdminRole(Club.id)
        if (Club) {
            // add default settings to club
            await setDefaultSettings(Club.id)
            await createStripeCustomer(Club.id)
            return NextResponse.json({ error: false, Club: Club })
        } else {
            return NextResponse.json({ error: true, message: 'Something went wrong crating club' })
        }
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'club already exists' })
    }
}
