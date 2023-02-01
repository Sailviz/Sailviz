import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function deleteRace(id: any) {
    var result = await prisma.race.delete({
        where: {
            id: id
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id, 'id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        console.log(req.body)

        var id = req.body.id

        var race = await deleteRace(id)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};