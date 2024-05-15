import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findRace(fleetId: any) {
    var result = await prisma.race.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function findFleet(fleetId: string) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function createLap(resultId: string, time: number) {
    var res = await prisma.lap.create({
        data: {
            time: time,
            result: {
                connect: {
                    id: resultId
                }
            },
        }
    })
    return res;
}

const CreateLap = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.resultId, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var resultId = req.body.resultId
        var time = req.body.time

        var lap = await createLap(resultId, time)
        if (!lap) {
            res.json({ error: true, message: 'Could not create lap' });
            return
        }
        res.json({ error: false, result: lap });
    }

}

export default CreateLap