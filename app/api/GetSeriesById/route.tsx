import prisma from 'components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        },
        include: {
            races: {
                include: {
                    fleets: {
                        include: {
                            results: {
                                include: {
                                    boat: true
                                }
                            }
                        }
                    }
                }
            },
            fleetSettings: true
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
        assert.notStrictEqual(undefined, req.seriesId)
    } catch (e) {
        return Response.json({ error: true, message: "information missing" });
    }

    var seriesId = req.seriesId
    var Series = await findSeries(seriesId)
    if (Series) {
        return Response.json({ error: false, series: Series });
    }
    else {
        return Response.json({ error: "can't find series" }, { status: 406 });
    }

};