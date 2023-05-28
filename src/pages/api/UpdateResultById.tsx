import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

type SettingsType = {
    numberToCount: number
}

async function updateResult(result: ResultsDataType) {
    var res = await prisma.race.update({
        where: {
            id: result.raceId
        },
        data: {
            results: {
                update: {
                    where: {
                        id: result.id
                    },
                    data: {
                        SailNumber: result.SailNumber,
                        BoatId: result.BoatId,
                        CorrectedTime: result.CorrectedTime,
                        Crew: result.Crew,
                        Helm: result.Helm,
                        Laps: result.Laps,
                        Position: result.Position,
                        Time: result.Time
                    }
                }
            }

        },
        include: {
            results: true
        }
    })
    return res;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.result);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        var result = req.body.result

        var race = await updateResult(result)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'result not found' });
        }
    }
};