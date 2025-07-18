import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getFleets(seriesId: string) {
    var result = await prisma.fleetSettings.findMany({
        where: {
            seriesId: seriesId
        },
        include: {
            boats: true
        }
    })
    if (result == null) {
        return
    }
    return result
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    var seriesId = searchParams.get('id')

    if (seriesId == undefined) {
        return NextResponse.json({ error: "can't find series" }, { status: 400 })
    }

    var fleet = await getFleets(seriesId)
    if (fleet) {
        return NextResponse.json(fleet)
    } else {
        return NextResponse.json({ error: "can't find fleets" }, { status: 406 })
    }
}
