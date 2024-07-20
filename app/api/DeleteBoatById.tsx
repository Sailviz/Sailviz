import prisma from '../../../components/prisma'
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

const DeleteBoatById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var boatId = req.body.id

        var boat = await findBoat(boatId)
        if (boat) {
            await deleteRace(boatId)
            res.json({ error: false, boat: boat });
        } else {
            // User exists
            res.json({ error: true, message: 'boat not found' });
        }
    }
};

export default DeleteBoatById