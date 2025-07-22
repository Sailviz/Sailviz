import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function createSeries(seriesName: string, clubId: string, length: number) {
    var res = await prisma.series.create({
        data: {
            name: seriesName,
            settings: {
                numberToCount: 0,
                pursuitLength: length
            },
            club: {
                connect: {
                    id: clubId
                }
            }
        }
    })
    return res
}

async function getClub(clubId: string) {
    var club = await prisma.club.findUnique({
        where: { id: clubId }
    })
    if (!club) {
        throw new Error('Club not found')
    }
    return club as unknown as ClubDataType
}

async function attachFleetSettings(seriesId: string) {
    var res = await prisma.fleetSettings.create({
        data: {
            name: 'Main Fleet',
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
    console.log('Creating Series for clubId: ' + clubId)

    const club = await getClub(clubId)

    let authorised = await isRequestAuthorised(clubId, 'club')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var seriesName = req.seriesName
    var Series = await createSeries(seriesName, clubId, club.settings.pursuitLength)
    if (Series) {
        await attachFleetSettings(Series.id)
        return NextResponse.json({ res: Series }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Something went wrong creating Series' }, { status: 500 })
    }
}
