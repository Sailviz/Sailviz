import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.findFirst({
        where: {
            id: fleetSettingsId
        },
    })
    return result;
}

async function deleteFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.delete({
        where: {
            id: fleetSettingsId
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.fleetSettingsId, 'fleetSettingsId required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
        return;
    }

    var fleetSettingsId = req.fleetSettingsId

    var fleet = await findFleet(fleetSettingsId)
    if (fleet) {
        await deleteFleet(fleetSettingsId)
        return Response.json({ error: false, fleet: fleet });
    } else {
        // User exists
        return Response.json({ error: true, message: 'fleet not found' });
    }
}
