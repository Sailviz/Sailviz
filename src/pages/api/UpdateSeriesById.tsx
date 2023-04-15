import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

type SettingsType = {
    numberToCount: number
}

async function updateSeries(seriesId: any, settings: SettingsType) {
    var result = await prisma.series.update({
        where: {
            id: seriesId
        },
        data: {
            settings: settings
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
        var seriesId = req.body.seriesId
        var settings = req.body.settings

        var series = await updateSeries(seriesId, settings)
        if (series) {
            res.json({ error: false, series: series });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};