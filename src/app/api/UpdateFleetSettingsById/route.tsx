import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function updateFleetSettings(fleet: FleetSettingsType) {
    var result = await prisma.fleetSettings.update({
        where: {
            id: fleet.id
        },
        data: {
            name: fleet.name,
            startDelay: fleet.startDelay
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

    var fleet: FleetSettingsType = req.fleet

    let authorised = await isRequestAuthorised(fleet.id, 'fleetsettings')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var updatedSettings = await updateFleetSettings(fleet)
    if (updatedSettings) {
        return NextResponse.json({ res: updatedSettings }, { status: 200 })
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 })
}
