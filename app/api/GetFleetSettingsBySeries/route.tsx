import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'components/prisma'
import assert from 'assert';

async function getFleets(seriesId: string) {
    var result = await prisma.fleetSettings.findMany({
        where: {
            seriesId: seriesId
        },
        include: {
            fleets: true
        }
    })
    if (result == null) {
        return
    }
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId);
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }
    var seriesId = req.seriesId

    if (req.method === 'POST') {
        var fleet = await getFleets(seriesId)
        if (fleet) {
            return Response.json({ error: false, fleet: fleet });
        }
        else {
            return Response.json({ error: true, message: 'Could not find fleet' });
        }
    }
}
