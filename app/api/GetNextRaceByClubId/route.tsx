import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
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

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId

    var race = await findRace(clubId)
    if (race[0]) {
        return Response.json({ error: false, race: race[0] });
    } else {
        // User exists
        return Response.json({ error: true, message: 'race not found' });
    }
}
