import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";


import assert from 'assert';

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
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

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'seriesId required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var seriesId = req.seriesId
    console.log(seriesId)

    var series = await findSeries(seriesId)
    if (series) {
        await deleteraces(seriesId)
        await deleteSeries(seriesId)
        return NextResponse.json({ error: false });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'series not found' });
    }
}
