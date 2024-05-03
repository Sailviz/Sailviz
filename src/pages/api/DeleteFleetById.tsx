import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findFleet(fleetId: any) {
    var result = await prisma.fleet.findFirst({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function deleteFleet(fleetId: any) {
    var result = await prisma.fleet.delete({
        where: {
            id: fleetId
        }
    })
    return result;
}

const DeleteFleetById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.fleetId, 'fleetId required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var fleetId = req.body.fleetId

        var fleet = await findFleet(fleetId)
        if (fleet) {
            await deleteFleet(fleetId)
            res.json({ error: false, fleet: fleet });
        } else {
            // User exists
            res.json({ error: true, message: 'fleet not found' });
        }
    }
};

export default DeleteFleetById