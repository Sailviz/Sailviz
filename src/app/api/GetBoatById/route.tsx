import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

import assert from 'assert'

async function findBoat(boatId: any) {
    var result = await prisma.boat.findFirst({
        where: {
            id: boatId
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    var boatId = searchParams.get('boatId')
    // check if we have all data.
    // The website stops this, but just in case
    if (boatId == null) {
        return NextResponse.json({ error: "can't find race" }, { status: 400 })
    }
    var boat = await findBoat(boatId)
    if (boat) {
        return NextResponse.json({ error: false, boat: boat })
    } else {
        return NextResponse.json({ error: "can't find boat" }, { status: 406 })
    }
}
