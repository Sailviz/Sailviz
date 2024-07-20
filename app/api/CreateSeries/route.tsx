import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function createSeries(seriesName: string, clubId: string) {
    var res = await prisma.series.create({
        data: {
            name: seriesName,
            settings: {},
            club: {
                connect: {
                    id: clubId
                }
            }
        },
    })
    return res;
}

async function attachFleetSettings(seriesId: string) {
    var res = await prisma.fleetSettings.create({
        data: {
            name: "Main Fleet",
            startDelay: 0,
            series: {
                connect: {
                    id: seriesId
                }
            },
            boats: {}
        }
    })
    return res;

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
    var Series = await createSeries(seriesName, clubId)
    if (Series) {
        await attachFleetSettings(Series.id)
        return Response.json({ error: false, series: Series })
    }
    else {
        return Response.json({ error: true, message: 'Something went wrong creating Series' });
    }
}
