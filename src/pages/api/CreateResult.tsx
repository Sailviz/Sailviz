import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
    })
    return result;
}

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

async function createEntryWithFleet(fleetId: string, raceId: string) {
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

async function createEntry(raceId: string) {
    var res = await prisma.result.create({
        data: {
            Helm: "",
            Crew: "",
            SailNumber: "",
            finishTime: 0,
            CorrectedTime: 0,
            PursuitPosition: 0,
            isDeleted: false,
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

        //check if race series has fleets enabled
        if (await findSeries(race.seriesId).then(series => series!.fleetsEnabled) == true) {
            if (!fleetId) {
                res.json({ error: true, message: 'Fleet required' });
                return
            }
            var fleet = await findFleet(fleetId)
            if (!fleet) {
                res.json({ error: true, message: 'Could not find fleet' });
                return
            }
            var result = await createEntryWithFleet(fleetId, race.id)
        } else {
            var result = await createEntry(race.id)
            res.json({ error: false, result: result });
        }

    }
};

export default CreateResult