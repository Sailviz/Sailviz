import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findSeries(id: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: id
        },
    })
    return result;
}

const GetSeriesById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var id = req.body.id

        var series = await findSeries(id)
        if (series) {
            res.json({ error: false, series: series });
        } else {
            // User exists
            res.json({ error: true, message: 'series not found' });
        }
    }
};

export default GetSeriesById