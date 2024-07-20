import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function updateFleet(fleet: FleetDataType) {
    var result = await prisma.fleet.update({
        where: {
            id: fleet.id
        },
        data: {
            startTime: fleet.startTime
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.fleet);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var fleet: FleetDataType = req.fleet

    var updatedRace = await updateFleet(fleet)
    if (updatedRace) {
        return Response.json({ error: false, race: updatedRace });
    } else {
        // User exists
        return Response.json({ error: true, message: 'race not found' });
    }
}
