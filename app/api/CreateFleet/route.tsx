import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'

import { isRequestAuthorised } from 'components/helpers/auth'

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        }
    })
    return result
}

async function createFleet(raceId: string, fleetSettingsId: string) {
    var res = await prisma.fleet.create({
        data: {
            startTime: 0,
            race: {
                connect: {
                    id: raceId
                }
            },
            fleetSettings: {
                connect: {
                    id: fleetSettingsId
                }
            }
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'Id required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var seriesId = req.seriesId

    //check that the user is authorized to perform the request
    let authorised = await isRequestAuthorised(request.cookies, seriesId, 'series')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var fleetSettingsId = req.fleetSettingsId

    var series = await findSeries(seriesId)

    if (series) {
        let res = await createFleet(seriesId, fleetSettingsId)
        return NextResponse.json({ res: res }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Could not find series' }, { status: 400 })
    }
}
