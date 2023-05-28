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

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesId);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesId = req.body.seriesId

        var series = await findSeries(seriesId)
        if (series) {
            res.json({ error: false, series: series });
        } else {
            // User exists
            res.json({ error: true, message: 'series not found' });
        }
    }
};