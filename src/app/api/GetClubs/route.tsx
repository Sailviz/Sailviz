import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getClubs() {
    var result = await prisma.club.findMany({
        include: {
            stripe: true
        }
    })
    return result
}

export async function GET(request: NextRequest) {
    var clubs = await getClubs()
    if (clubs) {
        return NextResponse.json(clubs)
    } else {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
}
