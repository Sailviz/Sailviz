import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'

import assert from 'assert'

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

async function createClub(name: string, displayName?: string) {
    return prisma.club.create({
        data: {
            name: name,
            displayName: displayName,
            settings: {}
        }
    })
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.name, 'Name required')
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var name = req.name
    var displayName = req.displayName

    var Existingclub = await findClub(name)
    if (!Existingclub) {
        var Club = await createClub(name, displayName)
        if (Club) {
            // add default settings to club
            await setDefaultSettings(Club.id)
            return NextResponse.json({ error: false, Club: Club })
        } else {
            return NextResponse.json({ error: true, message: 'Something went wrong crating club' })
        }
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'club already exists' })
    }
}
