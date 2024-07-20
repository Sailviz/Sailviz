import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';

async function findRace(fleetId: any) {
    var result = await prisma.race.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function findFleet(fleetId: string) {
    var result = await prisma.fleet.findUnique({
        where: {
            id: fleetId
        },
    })
    return result;
}

async function createLap(resultId: string, time: number) {
    var res = await prisma.lap.create({
        data: {
            time: time,
            isDeleted: false,
            result: {
                connect: {
                    id: resultId
                }
            },
        }
    })
    return res;
}

export async function POST(request: Request) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.resultId, 'Id required');

    } catch (bodyError) {
        return Response.json({ error: true, message: "information missing" });
        return;
    }

    var resultId = req.resultId
    var time = req.time

    var lap = await createLap(resultId, time)
    if (!lap) {
        return Response.json({ error: true, message: 'Could not create lap' });
        return
    }
    return Response.json({ error: false, result: lap });


}