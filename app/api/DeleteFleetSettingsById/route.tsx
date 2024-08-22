import prisma from 'components/prisma'
import { NextRequest, NextResponse } from "next/server";

import assert from 'assert';

async function findFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.findFirst({
        where: {
            id: fleetSettingsId
        },
    })
    return result;
}

async function deleteFleet(fleetSettingsId: any) {
    var result = await prisma.fleetSettings.delete({
        where: {
            id: fleetSettingsId
        }
    })
    return result;
}

export async function POST(request: NextRequest) {
    const req = await request.json()
    try {
        assert.notStrictEqual(undefined, req.fleetSettingsId, 'fleetSettingsId required');

    } catch (bodyError) {
        return NextResponse.json({ error: true, message: "information missing" });
        return;
    }

    var fleetSettingsId = req.fleetSettingsId

    var fleet = await findFleet(fleetSettingsId)
    if (fleet) {
        await deleteFleet(fleetSettingsId)
        return NextResponse.json({ error: false, fleet: fleet });
    } else {
        // User exists
        return NextResponse.json({ error: true, message: 'fleet not found' });
    }
}
