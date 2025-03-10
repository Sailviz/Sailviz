import prisma from 'components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    const cookieStore = cookies()
    const searchParams = request.nextUrl.searchParams

    var clubId = cookieStore.get('clubId')

    if (clubId == undefined) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var boat = await findBoats(clubId.value)
    if (boat) {
        return NextResponse.json({ error: false, boats: boat })
    } else {
        return NextResponse.json({ error: "can't find boat" }, { status: 406 })
    }
}
