import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';
import { AVAILABLE_PERMISSIONS } from 'components/helpers/users';
import { isRequestAuthorised } from 'components/helpers/auth';

async function updateRace(race: RaceDataType) {
    var result = await prisma.race.update({
        where: {
            id: race.id
        },
        data: {
            Duties: race.Duties,
            Time: race.Time,
            Type: race.Type,
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.race);

    } catch (bodyError) {
        return NextResponse.json({ error: "information missing" }, { status: 400 });
    }

    var race: RaceDataType = req.race

    let authorised = await isRequestAuthorised(request.cookies, AVAILABLE_PERMISSIONS.editRaces, race.id, "race")
    if (!authorised) {
        return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    var updatedRace = await updateRace(race)
    if (updatedRace) {
        return NextResponse.json({ res: updatedRace }, { status: 200 });
    }
    return NextResponse.json({ error: 'race not found' }, { status: 400 });
}
