import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'

async function findResult(id: any) {
    var result = await prisma.result.findFirst({
        where: {
            id: id
        },
        include: {
            boat: true,
            laps: {
                where: {
                    isDeleted: false
                },
                orderBy: {
                    time: 'asc'
                }
            }
        }
    })
    return result
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.id)
    } catch (bodyError) {
        return NextResponse.json({ error: true, message: 'information missing' })
    }

    var id = req.id

    var result = await findResult(id)
    if (result) {
        return NextResponse.json({ error: false, result: result })
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'result not found' })
    }
}
