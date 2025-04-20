import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function createSeries(seriesName: string, clubId: string) {
    var res = await prisma.series.create({
        data: {
            name: seriesName,
            settings: {},
            club: {
                connect: {
                    id: clubId
                }
            }
        }
    })
    return res
}

async function attachFleetSettings(seriesId: string) {
    var res = await prisma.fleetSettings.create({
        data: {
            name: 'Main Fleet',
            startDelay: 0,
            series: {
                connect: {
                    id: seriesId
                }
            },
            boats: {}
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesName, 'Name required')
        assert.notStrictEqual(undefined, req.clubId, 'Club required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var clubId = req.clubId

    let authorised = await isRequestAuthorised(clubId, 'club')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var seriesName = req.seriesName
    var Series = await createSeries(seriesName, clubId)
    if (Series) {
        await attachFleetSettings(Series.id)
        return NextResponse.json({ res: Series }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Something went wrong creating Series' }, { status: 500 })
    }
}
