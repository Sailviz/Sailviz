import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.findFirst({
        where: {
            id: fleetSettingsId
        },
    })
    return result;
}

async function deleteFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.delete({
        where: {
            id: fleetSettingsId
        }
    })
    return result;
}

const DeleteFleetById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.fleetSettingsId, 'fleetSettingsId required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var fleetSettingsId = req.body.fleetSettingsId

        var fleet = await findFleet(fleetSettingsId)
        if (fleet) {
            await deleteFleet(fleetSettingsId)
            res.json({ error: false, fleet: fleet });
        } else {
            // User exists
            res.json({ error: true, message: 'fleet not found' });
        }
    }
};

export default DeleteFleetById