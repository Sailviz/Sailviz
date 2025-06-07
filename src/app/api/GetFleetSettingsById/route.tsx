import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function getFleets(id: string) {
    var result = await prisma.fleetSettings.findUnique({
        where: {
            id: id
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

    var id = searchParams.get('id')

    if (id == undefined) {
        return NextResponse.json({ error: "can't find series" }, { status: 400 })
    }

    var fleet = await getFleets(id)
    if (fleet) {
        return NextResponse.json(fleet)
    } else {
        return NextResponse.json({ error: "can't find fleets" }, { status: 406 })
    }
}
