import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findBoats(boatId: any) {
    var result = await prisma.boat.findMany({
        where: {
            clubId: boatId
        }
    })
    return result;
}



export async function POST(request: Request) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (e) {
        return Response.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var boat = await findBoats(clubId)
    if (boat) {
        return Response.json({ error: false, boats: boat });
    }
    else {
        return Response.json({ error: "can't find boat" }, { status: 406 });
    }

};