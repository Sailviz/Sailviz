import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const clubId = ''

    if (!clubId) {
        return NextResponse.json({ message: 'Missing Club ID' }, { status: 400 })
    }

    const trackers = await prisma.tracker.findMany({
        where: {
            clubId: clubId
        }
    })

    return NextResponse.json({ trackers: trackers }, { status: 200 })
}
