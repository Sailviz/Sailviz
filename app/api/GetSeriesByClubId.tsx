import prisma from '../../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findSeries(clubId: any) {
    var result = await prisma.series.findMany({
        where: {
            clubId: clubId
        },
        include: {
            races: true
        }
    })
    return result;
}


const GetSeriesByClubId = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.clubId)
        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }

        var clubId = req.body.clubId
        var Series = await findSeries(clubId)
        if (Series) {
            res.json({ error: false, series: Series });
            return;
        }
        else {
            res.json({ error: true, message: 'Could not find series' });
        }
    }
};

export default GetSeriesByClubId