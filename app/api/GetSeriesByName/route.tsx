import prisma from 'components/prisma'
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


export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesName, 'Name required');
        assert.notStrictEqual(undefined, req.clubId, 'Club required');
    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var seriesName = req.seriesName
    var clubId = req.clubId

    var Series = await findSeries(seriesName, clubId)
    if (Series) {
        if (Series) {
            return Response.json({ error: false, series: Series });
        }
        else {
            return Response.json({ error: true, message: 'Could not find series' });
        }
    } else {
        // User exists
        return Response.json({ error: true, message: 'club not found' });
    }
}