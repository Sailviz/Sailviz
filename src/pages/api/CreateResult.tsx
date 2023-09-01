import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';


async function findRace(raceId: any) {
    var result = await prisma.race.findUnique({
        where: {
            id: raceId
        },
    })
    return result;
}

async function createEntry(raceId: string,) {
    var res = await prisma.result.create({
        data: {
            Helm: "",
            Crew: "",
            SailNumber: 0,
            finishTime: 0,
            CorrectedTime: 0,
            lapTimes: {
                "times": []
            },
            Position: 0,
            race: {
                connect: {
                    id: raceId
                }
            },
            boat: {}
        }
    })
    return res;
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.raceId, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var raceId = req.body.raceId
        var race = await findRace(raceId)

        if (race) {
            var result = await createEntry(raceId)
            res.json({ error: false, result: result });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};