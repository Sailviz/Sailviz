import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';
import { connect } from 'http2';


async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
    })
    return result;
}

async function createFleet(raceId: string, fleetSettingsId: string) {
    var res = await prisma.fleet.create({
        data: {
            startTime: 0,
            race: {
                connect: {
                    id: raceId
                }
            },
            fleetSettings: {
                connect: {
                    id: fleetSettingsId
                }
            }
        },
    })
    return res;
}

export async function POST(request: Request) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'Id required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
    }

    var seriesId = req.seriesId
    var fleetSettingsId = req.fleetSettingsId

    var series = await findSeries(seriesId)

    if (series) {
        var fleet = await createFleet(seriesId, fleetSettingsId)
        return Response.json({ error: false, fleet: fleet });
    }
    else {
        return Response.json({ error: true, message: 'Could not find series' });
    }
};
