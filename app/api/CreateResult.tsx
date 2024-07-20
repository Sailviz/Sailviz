import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findFleet(fleetId: string) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function createEntry(fleetId: string) {
    var res = await prisma.result.create({
        data: {
            Helm: "",
            Crew: "",
            SailNumber: "",
            finishTime: 0,
            CorrectedTime: 0,
            PursuitPosition: 0,
            HandicapPosition: 0,
            isDeleted: false,
            fleet: {
                connect: {
                    id: fleetId
                }
            },
            boat: {},
            laps: {},
            resultCode: "",
        },
        include: {
            laps: true,
        }
    })
    return res;
}

const CreateResult = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.fleetId, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var fleetId = req.body.fleetId

        var fleet = await findFleet(fleetId)
        if (!fleet) {
            res.json({ error: true, message: 'Could not find fleet' });
            return
        }
        var result = await createEntry(fleetId)
        res.json({ error: false, result: result });
    }

}

export default CreateResult