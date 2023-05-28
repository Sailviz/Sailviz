import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findRace(raceId: any) {
    var result = await prisma.race.findFirst({
        where: {
            id: raceId
        },
        include: {
            results: true
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.raceId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var raceId = req.body.raceId

        var race = await findRace(raceId)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};