import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';
import { cookies } from 'next/headers';

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


export async function GET(request: NextRequest) {
    const cookieStore = cookies()
    const searchParams = request.nextUrl.searchParams

    var id = cookieStore.get('clubId')
    var page = searchParams.get('page')

    if (id == undefined || page == undefined) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var series = await findSeries(id.value)
    if (series) {
        var races = await findRaces(series.map(s => s.id), (parseInt(page) - 1) * 10, 10)
        var count = await countRaces(series.map(s => s.id))
        return NextResponse.json({ error: false, races: races, count: count });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
