import prisma from '@/components/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'
import { isRequestAuthorised } from '@/components/helpers/auth'

async function createLap(resultId: string, time: number) {
    var res = await prisma.lap.create({
        data: {
            time: time,
            isDeleted: false,
            result: {
                connect: {
                    id: resultId
                }
            }
        }
    })
    return res
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    // check if we have all data.
    // The website stops this, but just in case
    try {
        assert.notStrictEqual(undefined, req.resultId, 'Id required')
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    var resultId = req.resultId

    let authorised = await isRequestAuthorised(request.cookies, resultId, 'result')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var time = req.time

    var lap = await createLap(resultId, time)
    if (lap) {
        return NextResponse.json({ res: lap }, { status: 200 })
    }
    return NextResponse.json({ error: 'Could not create lap' }, { status: 500 })
}
