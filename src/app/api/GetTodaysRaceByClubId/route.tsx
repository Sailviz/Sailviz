import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'

import assert from 'assert'

async function findRace(clubId: string) {
    var result = await prisma.race.findMany({
        where: {
            AND: [
                {
                    Time: {
                        gte: dayjs().set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss'),
                        lte: dayjs().set('hour', 24).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')
                    }
                },
                {
                    series: {
                        clubId: clubId
                    }
                }
            ]
        },
        orderBy: {
            Time: 'asc'
        },
        select: {
            id: true,
            number: true,
            Time: true,
            series: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var clubId = req.clubId

    var race = await findRace(clubId)
    if (race) {
        return NextResponse.json({ error: false, races: race })
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' })
    }
}
