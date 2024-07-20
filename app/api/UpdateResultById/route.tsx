import prisma from 'components/prisma'
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


export async function POST(request: Request) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.result);

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
        return;
    }
    var result = req.result
    if (result.boat != null) {
        await updateBoat(result)
    }
    var race = await updateResult(result)
    if (race) {
        return Response.json({ error: false, race: race });
    } else {
        // User exists
        return Response.json({ error: true, message: 'result not found' });
    }
}
