import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getRoles(clubId: string) {
    var result = await prisma.role.findMany({
        where: {
            clubId: clubId
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
    var roles = await getRoles(clubId)
    if (roles) {
        return NextResponse.json({ error: false, roles: roles })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find roles' })
    }
}
