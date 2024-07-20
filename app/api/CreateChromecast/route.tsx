import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function createChromecast(chromecast: ChromecastDataType) {
    var res = await prisma.chromecasts.create({
        data: {
            name: chromecast.name,
            host: chromecast.host,
            settings: {},
            club: {
                connect: {
                    id: chromecast.clubId
                }
            }
        },
    })
    return res;
}


export async function POST(request: Request) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.chromecast, 'Name required');
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var chromecastdata = req.chromecast
    var chromecast = await createChromecast(chromecastdata)
    if (chromecast) {
        return Response.json({ error: false, chromecast: chromecast })
    }
    else {
        return Response.json({ error: true, message: 'Something went wrong creating chromecast' });
    }

};