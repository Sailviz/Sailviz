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

async function createFleet(seriesId: string) {
    var res = await prisma.fleet.create({
        data: {
            name: "Fleet",
            startTime: 0,
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
        var number = 1
        //this numbers the race with the lowest number that is not being used.

        if (series) {
            var fleet = await createFleet(seriesId)
            res.json({ error: false, fleet: fleet });
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};

export default CreateFleet