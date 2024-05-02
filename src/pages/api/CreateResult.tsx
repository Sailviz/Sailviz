import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';
import { createRace } from '../../components/apiMethods';


async function findRace(fleetId: any) {
    var result = await prisma.race.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function createEntry(fleetId: string,) {
    var res = await prisma.result.create({
        data: {
            Helm: "",
            Crew: "",
            SailNumber: "",
            finishTime: 0,
            CorrectedTime: 0,
            PursuitPosition: 0,
            isDeleted: false,
            fleet: {
                connect: {
                    id: fleetId
                }
            },
            boat: {}
        }
    })
    return res;
}


const CreateRace = async (req: NextApiRequest, res: NextApiResponse) => {
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
        var race = await findRace(fleetId)

        if (race) {
            var result = await createEntry(fleetId)
            res.json({ error: false, result: result });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};

export default CreateRace