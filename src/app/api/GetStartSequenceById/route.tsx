import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function updateStartSequence(seriesId: string) {
    const sequence = await prisma.startSequence.findMany({
        where: { seriesId: seriesId },
        orderBy: { order: 'asc' }
    })
    return sequence
}
export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.seriesId)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var seriesId = req.seriesId
    var sequence = await updateStartSequence(seriesId)
    if (sequence) {
        return NextResponse.json({ sequence: sequence }, { status: 200 })
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 })
}
