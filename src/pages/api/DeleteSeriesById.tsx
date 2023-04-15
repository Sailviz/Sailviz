import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findSeries(seriesId: any) {
    var result = await prisma.series.findFirst({
        where: {
            id: seriesId
        },
    })
    return result;
}

async function deleteraces(seriesId: any) {
    var result = await prisma.race.deleteMany({
        where: {
            seriesId: seriesId
        }
    })
    return result;
}

async function deleteSeries(seriesId: any) {
    var result = await prisma.series.deleteMany({
        where: {
            id: seriesId
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesId, 'seriesId required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        console.log(req.body)

        var seriesId = req.body.seriesId

        var series = await findSeries(seriesId)
        if (series) {
            await deleteraces(seriesId)
            await deleteSeries(seriesId)
            res.json({ error: false, series: series });
        } else {
            // User exists
            res.json({ error: true, message: 'series not found' });
        }
    }
};