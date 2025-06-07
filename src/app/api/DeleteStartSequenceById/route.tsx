import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function deleteStartSequence(id: string) {
    var res = await prisma.startSequence.delete({
        where: {
            id: id
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id, 'Id required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var id = req.id

    let authorised = await isRequestAuthorised(id, 'startSequence')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var startSequence = await deleteStartSequence(id)
    if (startSequence) {
        return NextResponse.json({ res: startSequence }, { status: 200 })
    }
    return NextResponse.json({ error: 'Could not delete startSequence' }, { status: 400 })
}
