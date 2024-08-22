import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

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
        return NextResponse.json({ error: true, message: "information missing" });
    }
    console.log(req.body)

    var raceId = req.raceId

    var race = await findRace(raceId)
    if (race) {
        await deleteRace(raceId)
        return NextResponse.json({ error: false, race: race });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
