import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findRace(raceId: any) {
    var result = await prisma.race.findFirst({
        where: {
            id: raceId
        },
    })
    return result;
}

async function deleteRace(raceId: any) {
    var result = await prisma.race.delete({
        where: {
            id: raceId
        }
    })
    return result;
}

const DeleteRaceById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.raceId, 'raceId required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        console.log(req.body)

        var raceId = req.body.raceId

        var race = await findRace(raceId)
        if (race) {
            await deleteRace(raceId)
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default DeleteRaceById