import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function updateRace(race: RaceDataType) {
    var result = await prisma.race.update({
        where: {
            id: race.id
        },
        data: {
            OOD: race.OOD,
            AOD: race.AOD,
            SO: race.SO,
            ASO: race.ASO,
            Time: race.Time,
            Type: race.Type,
        }
    })
    return result;
}

const UpdateRaceById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.race);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var race: RaceDataType = req.body.race

        var updatedRace = await updateRace(race)
        if (updatedRace) {
            res.json({ error: false, race: updatedRace });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};

export default UpdateRaceById