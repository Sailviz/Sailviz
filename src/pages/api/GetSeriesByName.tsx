import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findSeries(seriesName: string, clubId: string) {
    var result = await prisma.series.findFirst({
        where: {
            name: seriesName,
            clubId: clubId
        },
    })
    return result;
}


const GetSeriesByName = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.seriesName, 'Name required');
            assert.notStrictEqual(undefined, req.body.clubId, 'Club required');
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var seriesName = req.body.seriesName
        var clubId = req.body.clubId

        var Series = await findSeries(seriesName, clubId)
        if (Series) {
            if (Series) {
                res.json({ error: false, series: Series });
                return;
            }
            else {
                res.json({ error: true, message: 'Could not find series' });
            }
        } else {
            // User exists
            res.json({ error: true, message: 'club not found' });
            return;
        }
    }
};

export default GetSeriesByName