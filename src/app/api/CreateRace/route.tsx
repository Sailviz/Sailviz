import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function findRace(seriesId: any) {
    var result = await prisma.race.findMany({
        where: {
            seriesId: seriesId
        }
    })
    return result
}

async function createRace(number: number, seriesId: any, time: any, duties: object) {
    var res = await prisma.race.create({
        data: {
            number: number,
            Time: time,
            Type: 'Handicap',
            Duties: duties,
            series: {
                connect: {
                    id: seriesId
                }
            }
        }
    })
    return res
}

async function createFleets(raceId: string, seriesId: string) {
    // find fleets on series
    var fleets = await prisma.fleetSettings.findMany({
        where: {
            seriesId: seriesId
        }
    })
    // create fleet for each fleet setting
    fleets.forEach(async fleet => {
        await prisma.fleet.create({
            data: {
                startTime: 0,
                fleetSettings: {
                    connect: {
                        id: fleet.id
                    }
                },
                race: {
                    connect: {
                        id: raceId
                    }
                }
            }
        })
    })
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'Id required')
        assert.notStrictEqual(undefined, req.clubId, 'Club required')
        assert.notStrictEqual(undefined, req.time, 'time required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var seriesId = req.seriesId

    let authorised = await isRequestAuthorised(seriesId, 'series')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var clubId = req.clubId
    var time = req.time

    var clubdata = await prisma.club.findUnique({
        where: {
            id: clubId
        }
    })
    if (!clubdata) {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
    let club = { ...clubdata } as ClubDataType
    let duties = club.settings!.duties.reduce((obj, key, index) => {
        obj[key] = ''
        return obj
    }, {} as { [key: string]: any })

    var races: RaceDataType[] = (await findRace(seriesId)) as RaceDataType[]
    var number = 1
    //this numbers the race with the lowest number that is not being used.
    while (races.some(object => object.number === number)) {
        number++
    }
    if (races) {
        var race = await createRace(number, seriesId, time, duties)
        createFleets(race.id, seriesId)
        return NextResponse.json({ res: race }, { status: 200 })
    }

    return NextResponse.json({ error: 'Could not find series' }, { status: 400 })
}
