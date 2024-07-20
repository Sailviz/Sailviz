import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function updateRace(race: RaceDataType) {
    var result = await prisma.race.update({
        where: {
            id: race.id
        },
        data: {
            OOD: race.OOD,
            AOD: race.AOD,
            SO: race.SO,
            ASO: race.ASO,
            Time: race.Time,
            Type: race.Type,
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.race);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var race: RaceDataType = req.race

    var updatedRace = await updateRace(race)
    if (updatedRace) {
        return Response.json({ error: false, race: updatedRace });
    } else {
        // User exists
        return Response.json({ error: true, message: 'race not found' });
    }
}
