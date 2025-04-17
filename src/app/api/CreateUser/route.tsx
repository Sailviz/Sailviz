import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function findClub(clubId: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: clubId
        }
    })
    return result
}

async function createUser(clubId: string) {
    var user = await prisma.user.create({
        data: {
            username: '',
            displayName: '',
            password: null,
            clubId: clubId,
            roles: {},
            startPage: 'Dashboard'
        }
    })
    return user
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId, 'club required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var clubId = req.clubId

    let authorised = await isRequestAuthorised(request.cookies, clubId, 'club')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    //check club exists
    var club = await findClub(clubId)
    if (club == null) {
        return NextResponse.json({ error: 'Club does not exist' }, { status: 400 })
    }

    var user = await createUser(club.id)
    if (user) {
        return NextResponse.json({ res: user }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Something went wrong crating user account' }, { status: 500 })
    }
}
