import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from 'components/helpers/auth'

async function findFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.findFirst({
        where: {
            id: fleetSettingsId
        }
    })
    return result
}

async function deleteFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.delete({
        where: {
            id: fleetSettingsId
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.fleetSettingsId, 'fleetSettingsId required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var fleetSettingsId = req.fleetSettingsId

    let authorised = await isRequestAuthorised(request.cookies, fleetSettingsId, 'fleetsettings')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var fleet = await findFleet(fleetSettingsId)
    if (fleet) {
        await deleteFleet(fleetSettingsId)
        return NextResponse.json({ res: fleet }, { status: 200 })
    }
    return NextResponse.json({ error: 'fleet not found' }, { status: 400 })
}
