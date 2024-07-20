import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findBoat(boatId: any) {
    var result = await prisma.boat.findFirst({
        where: {
            id: boatId
        }
    })
    return result;
}



export async function POST(request: Request) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.boatId)
    } catch (e) {
        return Response.json({ error: true, message: "information missing" });
    }

    var boatId = req.boatId
    var boat = await findBoat(boatId)
    if (boat) {
        return Response.json({ error: false, boat: boat });
    }
    else {
        return Response.json({ error: "can't find boat" }, { status: 406 });
    }

};