import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';


async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
        include: {
            races: true
        }
    })
    return result;
}

async function createFleetSettings(seriesId: string) {
    var res = await prisma.fleetSettings.create({
        data: {
            name: "Fleet",
            startDelay: 0,
            series: {
                connect: {
                    id: seriesId
                }
            }
        },
    })
    return res;
}

async function createFleet(raceId: string, fleetSettingsId: string) {
    var res = await prisma.fleet.create({
        data: {
            startTime: 0,
            fleetSettings: {
                connect: {
                    id: fleetSettingsId
                }
            },
            race: {
                connect: {
                    id: raceId
                }
            }
        }
    })
    return res;
}

const CreateFleet = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesId, 'Id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesId = req.body.seriesId

        var series = await findSeries(seriesId)

        if (series) {
            var fleetSettings = await createFleetSettings(seriesId)
            series.races.forEach((race) => {
                createFleet(race.id, fleetSettings.id)

            }
            )
            res.json({ error: false, fleet: fleetSettings });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};

export default CreateFleet