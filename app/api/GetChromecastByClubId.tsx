import prisma from '../../../components/prisma'
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


const GetChromecastByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.clubId)
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var clubId = req.body.clubId
        var chromecast = await findChromecast(clubId)
        if (chromecast) {
            res.json({ error: false, chromecasts: chromecast });
            return;
        }
        else {
            res.json({ error: true, message: 'Could not find chromecast' });
        }
    }
};

export default GetChromecastByClubId