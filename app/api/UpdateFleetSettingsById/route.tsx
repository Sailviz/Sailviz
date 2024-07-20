import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";
import assert from 'assert';

async function updateFleetSettings(fleet: FleetSettingsType) {
    var result = await prisma.fleetSettings.update({
        where: {
            id: fleet.id
        },
        data: {
            name: fleet.name,
            startDelay: fleet.startDelay,
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()

    try {
        assert.notStrictEqual(undefined, req.fleet);

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
    }

    var fleet: FleetSettingsType = req.fleet

    var updatedRace = await updateFleetSettings(fleet)
    if (updatedRace) {
        return NextResponse.json({ error: false, race: updatedRace });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'race not found' });
    }
}
