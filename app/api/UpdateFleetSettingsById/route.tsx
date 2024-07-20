import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function updateFleetSettings(fleet: FleetSettingsType) {
    var result = await prisma.fleetSettings.update({
        where: {
            id: fleet.id
        },
        data: {
            name: fleet.name,
            startDelay: fleet.startDelay,
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

    var fleet: FleetSettingsType = req.fleet

    var updatedRace = await updateFleetSettings(fleet)
    if (updatedRace) {
        return Response.json({ error: false, race: updatedRace });
    } else {
        // User exists
        return Response.json({ error: true, message: 'race not found' });
    }
}
