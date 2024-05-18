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

async function createEntry(fleetId: string, raceId: string) {
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
            assert.notStrictEqual(undefined, req.body.raceId, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var raceId = req.body.raceId
        var fleetId = req.body.fleetId

        var race = await findRace(raceId)
        if (!race) {
            res.json({ error: true, message: 'Could not find race' });
            return
        }

        if (!fleetId) {
            res.json({ error: true, message: 'Fleet required' });
            return
        }

        var fleet = await findFleet(fleetId)
        if (!fleet) {
            res.json({ error: true, message: 'Could not find fleet' });
            return
        }
        var result = await createEntry(fleetId, race.id)
        res.json({ error: false, result: result });
    }

}

export default CreateResult