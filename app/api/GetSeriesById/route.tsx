import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

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


export async function POST(request: NextRequest) {
    console.log
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId)
    } catch (e) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var seriesId = req.seriesId
    var Series = await findSeries(seriesId)
    if (Series) {
        return NextResponse.json({ error: false, series: Series });
    }
    else {
        return NextResponse.json({ error: "can't find series" }, { status: 406 });
    }

};