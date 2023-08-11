import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function updateBoat(boat: BoatDataType) {
    var result = await prisma.boats.update({
        where: {
            id: boat.id
        },
        data: boat
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.boat);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var boat: BoatDataType = req.body.boat

        var updatedBoat = await updateBoat(boat)
        if (updatedBoat) {
            res.json({ error: false, boat: updatedBoat });
        } else {
            // User exists
            res.json({ error: true, message: 'boat not found' });
        }
    }
};