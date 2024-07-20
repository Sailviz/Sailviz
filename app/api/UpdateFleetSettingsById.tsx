import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';
import { updateFleetSettingsById } from '../../../components/apiMethods';

async function updateFleetSettings(fleet: FleetSettingsType) {
    var result = await prisma.fleetSettings.update({
        where: {
            id: fleet.id
        },
        data: {
            name: fleet.name,
            startDelay: fleet.startDelay,
        }
    })
    return result;
}

const UpdateFleetSettingsById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.fleet);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var fleet: FleetSettingsType = req.body.fleet

        var updatedRace = await updateFleetSettings(fleet)
        if (updatedRace) {
            res.json({ error: false, race: updatedRace });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default UpdateFleetSettingsById