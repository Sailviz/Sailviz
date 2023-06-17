import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findRace(boatId: any) {
    var result = await prisma.boats.findFirst({
        where: {
            id: boatId
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.boatId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var boatId = req.body.boatId

        var boat = await findRace(boatId)
        if (boat) {
            res.json({ error: false, boat: boat });
        } else {
            // User exists
            res.json({ error: true, message: 'boat not found' });
        }
    }
};