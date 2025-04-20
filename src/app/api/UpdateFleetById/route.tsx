import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function updateFleet(fleet: FleetDataType) {
    var result = await prisma.fleet.update({
        where: {
            id: fleet.id
        },
        data: {
            startTime: fleet.startTime
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.fleet)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var fleet: FleetDataType = req.fleet

    let authorised = await isRequestAuthorised(fleet.id, 'fleet')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var updatedFleet = await updateFleet(fleet)
    if (updatedFleet) {
        return NextResponse.json({ res: updatedFleet }, { status: 200 })
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 })
}
