import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'

import assert from 'assert'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

async function findSeries(id: string) {
    var result = await prisma.series.findMany({
        where: {
            clubId: id
        }
    })
    return result
}

async function findRaces(seriesId: string[], skip: number, take: number, date: string, historical: boolean) {
    var result = await prisma.race.findMany({
        skip: skip,
        take: take,
        where: {
            seriesId: {
                in: seriesId
            },
            ...(historical ? { Time: { lte: date } } : { Time: { gte: date } })
        },
        include: {
            series: true
        },
        orderBy: {
            Time: historical ? 'desc' : 'asc'
        }
    })
    return result
}

async function countRaces(seriesId: string[], date: string, historical: boolean) {
    var result = await prisma.race.count({
        where: {
            seriesId: {
                in: seriesId
            },
            ...(historical ? { Time: { lte: date } } : { Time: { gte: date } })
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const cookieStore = cookies()
    const searchParams = request.nextUrl.searchParams

    var id = cookieStore.get('clubId')
    var page = searchParams.get('page')
    var date = searchParams.get('date')
    var historical = searchParams.get('historical') == 'true'

    date = dayjs(date).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')

    if (id == undefined || page == undefined || date == undefined) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var series = await findSeries(id.value)
    if (series) {
        var races = await findRaces(
            series.map(s => s.id),
            (parseInt(page) - 1) * 10,
            10,
            date,
            historical
        )
        var count = await countRaces(
            series.map(s => s.id),
            date,
            historical
        )
        return NextResponse.json({ error: false, races: races, count: count })
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' })
    }
}
