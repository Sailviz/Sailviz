import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import dayjs from 'dayjs';

import assert from 'assert';

async function findRace(clubId: string) {
    var result = await prisma.race.findMany({
        where: {
            AND: [{
                Time: {
                    gte: dayjs().format('YYYY-MM-DD HH:mm').toString()
                }
            }, {
                series: {
                    clubId: clubId
                }
            }]


        },
        orderBy: {
            Time: 'asc'
        },
        take: 1,
        select: {
            id: true,
            number: true,
            series: {
                select: {
                    name: true
                }
            }
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId

    var race = await findRace(clubId)
    if (race[0]) {
        return NextResponse.json({ error: false, race: race[0] });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
