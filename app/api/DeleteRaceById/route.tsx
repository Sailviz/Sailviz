import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function findRace(raceId: any) {
    var result = await prisma.race.findFirst({
        where: {
            id: raceId
        },
    })
    return result;
}

async function deleteRace(raceId: any) {
    var result = await prisma.race.delete({
        where: {
            id: raceId
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.raceId, 'raceId required');

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var raceId = req.raceId

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editResults, raceId, "race")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var race = await findRace(raceId)
    if (race) {
        await deleteRace(raceId)
        return NextResponse.json({ res: race }, { status: 200 });
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 });
}
