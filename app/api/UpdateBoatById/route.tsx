import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function updateBoat(boat: BoatDataType) {
    var result = await prisma.boat.update({
        where: {
            id: boat.id
        },
        data: boat
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.boat);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var boat: BoatDataType = req.boat

    var updatedBoat = await updateBoat(boat)
    if (updatedBoat) {
        return Response.json({ error: false, boat: updatedBoat });
    } else {
        // User exists
        return Response.json({ error: true, message: 'boat not found' });
    }
}
