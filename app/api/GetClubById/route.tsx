import { NextRequest, NextResponse } from 'next/server'
import prisma from 'components/prisma'
import assert from 'assert'

async function getClub(id: string) {
    var result = await prisma.club.findFirst({
        where: {
            id: id
        }
    })
    if (result == null) {
        return
    }
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }
    var id = req.id
    var club = await getClub(id)
    if (club) {
        return NextResponse.json({ error: false, club: club })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
}
