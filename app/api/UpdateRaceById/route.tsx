import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

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
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var race: RaceDataType = req.race

    var updatedRace = await updateRace(race)
    if (updatedRace) {
        return NextResponse.json({ error: false, race: updatedRace });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
