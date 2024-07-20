import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findBoat(boat: string) {
    var result = await prisma.boat.findFirst({
        where: {
            id: boat
        },
    })
    return result;
}

async function deleteRace(boat: string) {
    var result = await prisma.boat.delete({
        where: {
            id: boat
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var boatId = req.id

    var boat = await findBoat(boatId)
    if (boat) {
        await deleteRace(boatId)
        return Response.json({ error: false, boat: boat });
    } else {
        // User exists
        return Response.json({ error: true, message: 'boat not found' });
    }
}
