import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
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
    var Series = await createSeries(seriesName, clubId)
    if (Series) {
        await attachFleetSettings(Series.id)
        return NextResponse.json({ error: false, series: Series })
    }
    else {
        return NextResponse.json({ error: true, message: 'Something went wrong creating Series' });
    }
}
