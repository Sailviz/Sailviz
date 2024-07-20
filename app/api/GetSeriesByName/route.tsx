import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

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


export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesName, 'Name required');
        assert.notStrictEqual(undefined, req.clubId, 'Club required');
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var seriesName = req.seriesName
    var clubId = req.clubId

    var Series = await findSeries(seriesName, clubId)
    if (Series) {
        if (Series) {
            return NextResponse.json({ error: false, series: Series });
        }
        else {
            return NextResponse.json({ error: true, message: 'Could not find series' });
        }
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'club not found' });
    }
}