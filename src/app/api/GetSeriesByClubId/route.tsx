import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'

import assert from 'assert'

async function findSeries(clubId: any) {
    return prisma.$queryRaw`
        SELECT s.*, 
               JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id', r.id,
                       'number', r.number,
                       'Time', r.Time,
                       'Duties', r.Duties,
                       'Type', r.Type,
                       'seriesId', r.seriesId
                   )
               ) as races
        FROM Series s
        LEFT JOIN Race r ON s.id = r.seriesId
        WHERE s.clubId = ${clubId}
        GROUP BY s.id
        ORDER BY MAX(r.Time) DESC
    `
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.clubId)
    } catch (e) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var clubId = req.clubId
    var Series = await findSeries(clubId)
    if (Series) {
        return NextResponse.json({ error: false, series: Series })
    } else {
        return NextResponse.json({ error: "can't find series" }, { status: 406 })
    }
}
