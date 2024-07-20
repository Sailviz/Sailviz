import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

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


export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (e) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var clubId = req.clubId
    var Series = await findSeries(clubId)
    if (Series) {
        return NextResponse.json({ error: false, series: Series });
    }
    else {
        return NextResponse.json({ error: "can't find series" }, { status: 406 });
    }

};