import prisma from '@/lib/prisma'
import { auth } from '@/server/auth'
import { NextRequest, NextResponse } from 'next/server'

async function getClub(id: string) {
    var result = await prisma.club.findUnique({
        where: {
            id: id
        },
        include: {
            stripe: true
        }
    })
    if (result == null) {
        return
    }
    return result
}

export async function GET(request: NextRequest) {
    const session = await auth()
    var clubId = session?.user.clubId
    if (clubId == null) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }
    var club = await getClub(clubId)
    if (club) {
        return NextResponse.json(club)
    } else {
        return NextResponse.json({ error: "can't find club" }, { status: 406 })
    }
}
