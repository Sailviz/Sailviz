import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function updateStartSequence(seriesId: string, updates: StartSequenceStep[]) {
    await prisma.$transaction(async tx => {
        for (const update of updates) {
            console.log(`Processing update: ${JSON.stringify(update)}`)
            if (update.id) {
                // Update existing entry
                await tx.startSequence.update({
                    where: { id: update.id },
                    data: { time: update.time, name: update.name, order: update.order, hoot: update.hoot, flagStatus: update.flagStatus, fleetStart: update.fleetStart }
                })
            } else {
                // Insert new step
                await tx.startSequence.create({
                    data: {
                        seriesId,
                        time: update.time,
                        name: update.name,
                        order: update.order,
                        hoot: update.hoot,
                        flagStatus: update.flagStatus,
                        fleetStart: update.fleetStart
                    }
                })
            }
        }
    })

    console.log('Sequences updated successfully!')
    return true
}
export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.seriesId)
        assert.notStrictEqual(undefined, req.startSequence)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var seriesId = req.seriesId
    var startSequence = req.startSequence
    var updatedSequence = await updateStartSequence(seriesId, startSequence)
    if (updatedSequence) {
        return NextResponse.json({ status: 200 })
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 })
}
