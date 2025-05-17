import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import assert from 'assert'

import { isRequestAuthorised, isRequestOwnData } from 'components/helpers/auth'
import { isRequestAuthorised, isRequestOwnData } from '@/components/helpers/auth'

async function findBoat(name: string, clubId: string) {
    var result = await prisma.boat.findFirst({
        where: {
            AND: [
                {
                    name: name
                },
                {
                    clubId: clubId
                }
            ]
        }
        }
    })
    return result
    return result
}

async function createBoat(name: string, crew: number, py: number, pursuitStartTime: number, clubId: string) {
    var boat = await prisma.boat.create({
        data: {
            name: name,
            crew: crew,
            py: py,
            pursuitStartTime: pursuitStartTime,
            club: {
                connect: {
                    id: clubId
                }
            }
        }
        }
    })
    return boat
    return boat
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.name)
        assert.notStrictEqual(undefined, req.crew)
        assert.notStrictEqual(undefined, req.py)
        assert.notStrictEqual(undefined, req.clubId)
        assert.notStrictEqual(undefined, req.pursuitStartTime)
        assert.notStrictEqual(undefined, req.name)
        assert.notStrictEqual(undefined, req.crew)
        assert.notStrictEqual(undefined, req.py)
        assert.notStrictEqual(undefined, req.clubId)
        assert.notStrictEqual(undefined, req.pursuitStartTime)
    } catch (bodyError) {
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
        return NextResponse.json({ error: 'information missing' }, { status: 400 })
    }

    //check that the user is authorized to perform the request
    let authorised = await isRequestAuthorised(request.cookies, req.clubId, 'club')
    let authorised = await isRequestAuthorised(req.clubId, 'club')
    if (!authorised) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    var name = req.name
    var crew = req.crew
    var py = req.py
    var clubId = req.clubId
    var pursuitStartTime = req.pursuitStartTime

    var ExistingBoat = await findBoat(name, clubId)
    console.log(ExistingBoat)
    if (!ExistingBoat) {
        var creationResult = await createBoat(name, crew, py, pursuitStartTime, clubId)
        if (creationResult) {
            return NextResponse.json({ res: creationResult }, { status: 200 })
        } else {
            return NextResponse.json({ error: 'Something went wrong crating boat' }, { status: 500 })
            return NextResponse.json({ res: creationResult }, { status: 200 })
        } else {
            return NextResponse.json({ error: 'Something went wrong crating boat' }, { status: 500 })
        }
    } else {
        return NextResponse.json({ error: 'Boat already exists' }, { status: 409 })
    }
}
        return NextResponse.json({ error: 'Boat already exists' }, { status: 409 })
    }
}
