import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';


async function updateResult(result: ResultsDataType) {
    var res = await prisma.result.update({
        where: {
            id: result.id
        },
        data: {
            SailNumber: result.SailNumber,
            CorrectedTime: result.CorrectedTime,
            Crew: result.Crew,
            Helm: result.Helm,
            finishTime: result.finishTime,
            resultCode: result.resultCode,
            PursuitPosition: result.PursuitPosition,
            HandicapPosition: result.HandicapPosition
        }
    })
    return res;
}

async function updateBoat(result: ResultsDataType) {
    var res = await prisma.result.update({
        where: {
            id: result.id
        },
        data: {
            boat: {
                connect: {
                    id: result.boat.id
                }
            }
        },
        include: {
            boat: true
        }
    })
    return res;
}


const UpdateResultById = async (req: NextApiRequest, res: NextApiResponse) => {
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
        if (result.boat != null) {
            await updateBoat(result)
        }
        var race = await updateResult(result)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'result not found' });
        }
    }
};

export default UpdateResultById