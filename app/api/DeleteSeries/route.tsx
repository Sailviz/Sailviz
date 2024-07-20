import prisma from 'components/prisma'
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
    var result = await prisma.series.delete({
        where: {
            id: seriesId
        }
    })
    return result;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.series, 'seriesId required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var seriesId = req.series.id
    console.log(seriesId)

    var series = await findSeries(seriesId)
    if (series) {
        await deleteraces(seriesId)
        await deleteSeries(seriesId)
        return Response.json({ error: false });
    } else {
        // User exists
        return Response.json({ error: true, message: 'series not found' });
    }
}
