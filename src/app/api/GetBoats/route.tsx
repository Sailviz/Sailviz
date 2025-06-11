import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

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
