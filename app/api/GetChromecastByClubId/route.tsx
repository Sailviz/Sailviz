import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findChromecast(clubId: any) {
    var result = await prisma.chromecasts.findMany({
        where: {
            clubId: clubId
        }
    })
    return result;
}


export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var chromecast = await findChromecast(clubId)
    if (chromecast) {
        return Response.json({ error: false, chromecasts: chromecast });
    }
    else {
        return Response.json({ error: true, message: 'Could not find chromecast' });
    }
}
