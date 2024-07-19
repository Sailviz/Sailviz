import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';
import { connect } from 'http2';


async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
    })
    return result;
}

async function createFleet(raceId: string, fleetSettingsId: string) {
    var res = await prisma.fleet.create({
        data: {
            startTime: 0,
            race: {
                connect: {
                    id: raceId
                }
            },
            fleetSettings: {
                connect: {
                    id: fleetSettingsId
                }
            }
        },
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
        var fleetSettingsId = req.body.fleetSettingsId

        var series = await findSeries(seriesId)

        if (series) {
            var fleet = await createFleet(seriesId, fleetSettingsId)
            res.json({ error: false, fleet: fleet });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};

export default CreateFleet