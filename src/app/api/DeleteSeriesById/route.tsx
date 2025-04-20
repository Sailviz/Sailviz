import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function findSeries(seriesId: any) {
    var result = await prisma.series.findUnique({
        where: {
            id: seriesId
        }
    })
    return result
}

async function deleteraces(seriesId: any) {
    var result = await prisma.race.deleteMany({
        where: {
            seriesId: seriesId
        }
    })
    return result
}

async function deleteSeries(seriesId: any) {
    var result = await prisma.series.delete({
        where: {
            id: seriesId
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.seriesId, 'seriesId required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var seriesId = req.seriesId

    let authorised = await isRequestAuthorised(seriesId, 'series')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var series = await findSeries(seriesId)
    if (series) {
        await deleteraces(seriesId)
        await deleteSeries(seriesId)
        return NextResponse.json({ res: series }, { status: 200 })
    }
    return NextResponse.json({ error: 'series not found' }, { status: 400 })
}
