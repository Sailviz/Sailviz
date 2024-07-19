import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function updateFleet(fleet: FleetDataType) {
    var result = await prisma.fleet.update({
        where: {
            id: fleet.id
        },
        data: {
            startTime: fleet.startTime
        }
    })
    return result;
}

const UpdateRaceById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.fleet);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var fleet: FleetDataType = req.body.fleet

        var updatedRace = await updateFleet(fleet)
        if (updatedRace) {
            res.json({ error: false, race: updatedRace });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default UpdateRaceById