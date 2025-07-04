import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function deleteLap(id: string) {
    var res = await prisma.lap.update({
        where: {
            id: id
        },
        data: {
            isDeleted: true
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

    let authorised = await isRequestAuthorised(id, 'lap')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var lap = await deleteLap(id)
    if (lap) {
        return NextResponse.json({ res: lap }, { status: 200 })
    }
    return NextResponse.json({ error: 'Could not delete lap' }, { status: 400 })
}
