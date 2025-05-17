import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getUsers(clubId: string) {
    var result = await prisma.user.findMany({
        where: {
            clubId: clubId
        },
        include: {
            roles: true
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }
    var clubId = req.clubId
    var user = await getUsers(clubId)
    if (user) {
        return NextResponse.json({ error: false, users: user })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find user' })
    }
}
