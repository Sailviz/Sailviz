import { NextRequest, NextResponse } from 'next/server'
import prisma from 'components/prisma'
import assert from 'assert'

async function getUser(id: string) {
    var result = await prisma.user.findFirst({
        where: {
            id: id
        },
        omit: {
            password: true
        },
        include: {
            roles: true
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
    console.log(id)
    if (req.method === 'POST') {
        var user = await getUser(id)
        if (user) {
            return NextResponse.json({ error: false, user: user })
        } else {
            return NextResponse.json({ error: true, message: 'Could not find user' })
        }
    }
}
