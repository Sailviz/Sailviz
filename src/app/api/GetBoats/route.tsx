import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'

async function findBoats(clubId: string) {
    var result = await prisma.boat.findMany({
        where: {
            clubId: clubId
        },
        orderBy: {
            name: 'asc'
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    var session = await auth()

    var clubId = session?.user.clubId

    if (clubId == undefined) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var boat = await findBoats(clubId)
    if (boat) {
        return NextResponse.json({ error: false, boats: boat })
    } else {
        return NextResponse.json({ error: "can't find boat" }, { status: 406 })
    }
}
