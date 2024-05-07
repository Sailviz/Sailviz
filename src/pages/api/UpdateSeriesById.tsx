import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

type SettingsType = {
    numberToCount: number
}

async function updateSeries(series: SeriesDataType) {
    var result = await prisma.series.update({
        where: {
            id: series.id
        },
        data: {
            settings: series.settings,
            name: series.name,
            fleetsEnabled: series.fleetsEnabled
        }
    })
    return result;
}

const UpdateSeriesById = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.series);

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        var series = req.body.series

        var updatedSeries = await updateSeries(series)
        if (updatedSeries) {
            res.json({ error: false, series: updatedSeries });
        } else {
            // User exists
            res.json({ error: true, message: 'series not found' });
        }
    }
};

export default UpdateSeriesById