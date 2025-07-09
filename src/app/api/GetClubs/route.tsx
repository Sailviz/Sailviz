import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import assert from 'assert'

async function getClubs() {
    var result = await prisma.club.findMany({})
    if (result == null) {
        return
    }
    return result
}

export async function GET(request: NextRequest) {
    var clubs = await getClubs()
    if (clubs) {
        return NextResponse.json({ error: false, clubs: clubs })
    } else {
        return NextResponse.json({ error: true, message: 'Could not find club' })
    }
}
