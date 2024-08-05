import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findSeries(id: string) {
    var result = await prisma.series.findMany({
        where: {
            clubId: id
        }
    })
    return result;
}

async function findRaces(seriesId: string[], skip: number, take: number) {
    var result = await prisma.race.findMany({
        skip: skip,
        take: take,
        where: {
            seriesId: {
                in: seriesId
            }
        },
        include: {
            series: true,
        },
        orderBy: {
            Time: 'asc'
        },
    })
    return result;
}

async function countRaces(seriesId: string[]) {
    var result = await prisma.race.count({

        where: {
            seriesId: {
                in: seriesId
            }
        }
    })
    return result;
}


export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var id = req.clubId
    var page = req.page

    var series = await findSeries(id)
    if (series) {
        var races = await findRaces(series.map(s => s.id), (page - 1) * 10, 10)
        var count = await countRaces(series.map(s => s.id))
        return NextResponse.json({ error: false, races: races, count: count });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
