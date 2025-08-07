import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getClub(id: string) {
    var result = await prisma.club.findFirst({
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
    const searchParams = request.nextUrl.searchParams
    var id = searchParams.get('clubId')
    try {
        assert(id, 'clubId is required')
    } catch (error) {
        return NextResponse.json({ error: true, message: 'clubId is required' }, { status: 400 })
    }
    var club = await getClub(id)
    if (club) {
        return NextResponse.json({ error: false, club: club })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
}
