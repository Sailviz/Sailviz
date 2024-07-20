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


export async function POST(request: Request) {
    console.log
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (e) {
        return Response.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var Series = await findSeries(clubId)
    if (Series) {
        return Response.json({ error: false, series: Series });
    }
    else {
        return Response.json({ error: "can't find series" }, { status: 406 });
    }

};